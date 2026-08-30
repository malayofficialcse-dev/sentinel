import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type Role = 'REPORTER' | 'INVESTIGATOR' | 'ANALYST' | 'REVIEWER' | 'AUDITOR' | 'ADMIN';
type User = { id: string; name: string; email: string; passwordHash: string; role: Role; status: string; permissions: string[]; createdAt: string };
type Store = Record<string, any[]>;

const root = path.resolve(process.env.SENTINEL_DATA_DIR || path.join(process.cwd(), 'data'));
const dbFile = path.join(root, 'sentinel.json');
const secret = process.env.JWT_SECRET || 'change-this-secret-in-production';
const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const permissions = ['SUBMIT_REPORT','VIEW_OWN_REPORTS','VIEW_ALL_CASES','MANAGE_CASES','VIEW_EVIDENCE','MANAGE_EVIDENCE','VIEW_ENTITIES','VIEW_GRAPH','VIEW_THREAT_INTEL','VIEW_FINANCIAL','VIEW_FINDINGS','REVIEW_FINDINGS','VIEW_REPORTS','GENERATE_REPORTS','VIEW_AUDIT_LOGS','MANAGE_USERS','MANAGE_ROLES','MANAGE_SYSTEM','VIEW_AI_AGENTS','VIEW_TIMELINE'];
const rolePermissions: Record<Role, string[]> = {
  REPORTER: ['SUBMIT_REPORT','VIEW_OWN_REPORTS'], INVESTIGATOR: permissions.filter((p) => !['MANAGE_USERS','MANAGE_ROLES','MANAGE_SYSTEM'].includes(p)),
  ANALYST: ['VIEW_ALL_CASES','VIEW_EVIDENCE','VIEW_ENTITIES','VIEW_GRAPH','VIEW_THREAT_INTEL','VIEW_FINANCIAL','VIEW_FINDINGS','VIEW_REPORTS','VIEW_AI_AGENTS'],
  REVIEWER: ['VIEW_ALL_CASES','VIEW_EVIDENCE','VIEW_FINDINGS','REVIEW_FINDINGS','VIEW_REPORTS'], AUDITOR: ['VIEW_ALL_CASES','VIEW_EVIDENCE','VIEW_AUDIT_LOGS','VIEW_REPORTS'], ADMIN: permissions,
};
function load(): Store {
  fs.mkdirSync(root, { recursive: true });
  if (fs.existsSync(dbFile)) return JSON.parse(fs.readFileSync(dbFile, 'utf8')) as Store;
  const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10);
  const admin: User = { id: 'USR-ADMIN', name: 'System Administrator', email: process.env.ADMIN_EMAIL || 'admin@sentinel.local', passwordHash, role: 'ADMIN', status: 'active', permissions, createdAt: now() };
  return { users: [admin], cases: [], evidence: [], entities: [], findings: [], reports: [], transactions: [], auditLogs: [], threatIntel: [] };
}
const store = load();
function save() { fs.writeFileSync(dbFile, JSON.stringify(store, null, 2)); }
function publicUser(u: User) { const { passwordHash: _hash, ...safe } = u; return safe; }
function ok(res: Response, data: any, status = 200) { return res.status(status).json({ data }); }
function fail(res: Response, status: number, message: string, code = 'ERROR') { return res.status(status).json({ message, code }); }
function tokenFor(u: User) { return jwt.sign({ sub: u.id, role: u.role }, secret, { expiresIn: '8h' }); }
function current(req: Request): User | undefined { return store.users.find((u) => u.id === (req as any).user?.sub); }
function auth(req: Request, res: Response, next: NextFunction) { const raw = req.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!raw) return fail(res, 401, 'Authentication required', 'UNAUTHORIZED'); try { (req as any).user = jwt.verify(raw, secret); next(); } catch { return fail(res, 401, 'Invalid or expired token', 'UNAUTHORIZED'); } }
function allow(...roles: Role[]) { return (req: Request, res: Response, next: NextFunction) => { const u = current(req); if (!u || (!roles.includes(u.role) && u.role !== 'ADMIN')) return fail(res, 403, 'You do not have permission for this action', 'FORBIDDEN'); next(); }; }
function audit(req: Request, action: string, resource: string, resourceId: string, details?: string) { const u = current(req); store.auditLogs.unshift({ id: newId('AUD'), timestamp: now(), userId: u?.id || 'SYSTEM', userName: u?.name || 'System', action, resource, resourceId, details, ipAddress: req.ip, sessionId: String((req as any).user?.sub || 'anonymous') }); save(); }
function paginate(items: any[], req: Request) { const page = Math.max(1, Number(req.query.page) || 1); const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25)); const start = (page - 1) * pageSize; return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }; }
function found(res: Response, key: string, value: string) { const item = store[key]?.find((x) => x.id.toLowerCase() === value.toLowerCase()); if (!item) { fail(res, 404, `${key.slice(0, -1)} not found`, 'NOT_FOUND'); return undefined; } return item; }

const app = express();
app.use(helmet()); app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true })); app.use(express.json({ limit: '10mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const api = express.Router();
api.get('/health', (_req, res) => ok(res, { status: 'ok', service: 'sentinel-backend', timestamp: now() }));
api.post('/auth/register', async (req, res) => { const { name, email, password } = req.body || {}; if (!name || !email || !password || password.length < 8) return fail(res, 400, 'name, email and a password of at least 8 characters are required', 'VALIDATION_ERROR'); if (store.users.some((u) => u.email === String(email).toLowerCase())) return fail(res, 409, 'Email is already registered', 'CONFLICT'); const u: User = { id: newId('USR'), name, email: String(email).toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role: 'REPORTER', status: 'active', permissions: rolePermissions.REPORTER, createdAt: now() }; store.users.push(u); save(); return ok(res, { user: publicUser(u), token: tokenFor(u) }, 201); });
api.post('/auth/login', async (req, res) => { const { email, password } = req.body || {}; const u = store.users.find((x) => x.email === String(email || '').toLowerCase()); if (!u || !(await bcrypt.compare(password || '', u.passwordHash))) return fail(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS'); if (u.status !== 'active') return fail(res, 403, 'This account is not active', 'ACCOUNT_INACTIVE'); return ok(res, { user: publicUser(u), token: tokenFor(u) }); });
api.get('/auth/me', auth, (req, res) => { const u = current(req); return u ? ok(res, publicUser(u)) : fail(res, 401, 'User not found', 'UNAUTHORIZED'); });
api.use(auth);
api.get('/users', allow('ADMIN'), (req, res) => ok(res, paginate(store.users.map(publicUser), req)));
api.post('/users', allow('ADMIN'), async (req, res) => { const { name, email, password, role = 'REPORTER' } = req.body || {}; if (!name || !email || !password || !rolePermissions[role as Role]) return fail(res, 400, 'Invalid user data', 'VALIDATION_ERROR'); if (store.users.some((u) => u.email === email.toLowerCase())) return fail(res, 409, 'Email is already registered', 'CONFLICT'); const u: User = { id: newId('USR'), name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role, status: 'active', permissions: rolePermissions[role as Role], createdAt: now() }; store.users.push(u); audit(req, 'CREATE', 'user', u.id); return ok(res, publicUser(u), 201); });
api.patch('/users/:id', allow('ADMIN'), (req, res) => { const u = found(res, 'users', String(req.params.id)); if (!u) return; Object.assign(u, { name: req.body.name ?? u.name, role: req.body.role ?? u.role, status: req.body.status ?? u.status, permissions: rolePermissions[req.body.role as Role] || u.permissions }); save(); audit(req, 'UPDATE', 'user', u.id); return ok(res, publicUser(u)); });

api.get('/cases', allow('INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (req, res) => { let a = store.cases; if (req.query.status) a = a.filter((x) => x.status === req.query.status); if (req.query.severity) a = a.filter((x) => x.severity === req.query.severity); if (req.query.search) a = a.filter((x) => JSON.stringify(x).toLowerCase().includes(String(req.query.search).toLowerCase())); return ok(res, paginate(a, req)); });
api.get('/cases/:id', allow('INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (req, res) => { const x = found(res, 'cases', String(req.params.id)); return x ? ok(res, x) : undefined; });
api.post('/cases', allow('INVESTIGATOR'), (req, res) => { const c = { id: newId('CASE'), title: req.body.title || 'Untitled case', description: req.body.description || '', severity: req.body.severity || 'MEDIUM', status: 'OPEN', riskScore: Number(req.body.riskScore) || 0, evidenceCount: 0, entityCount: 0, findingCount: 0, transactionCount: 0, relatedCaseCount: 0, tags: req.body.tags || [], createdAt: now(), updatedAt: now() }; store.cases.unshift(c); save(); audit(req, 'CREATE', 'case', c.id); return ok(res, c, 201); });
api.patch('/cases/:id', allow('INVESTIGATOR'), (req, res) => { const c = found(res, 'cases', String(req.params.id)); if (!c) return; Object.assign(c, req.body, { updatedAt: now() }); save(); audit(req, 'UPDATE', 'case', c.id); return ok(res, c); });
api.get('/evidence', allow('INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (req, res) => ok(res, paginate(store.evidence.filter((x) => !req.query.caseId || x.caseId === req.query.caseId), req)));
api.get('/evidence/:id', allow('INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (req, res) => { const x = found(res, 'evidence', String(req.params.id)); return x ? ok(res, x) : undefined; });
api.post('/evidence', allow('REPORTER','INVESTIGATOR'), upload.single('file'), (req, res) => { const f = (req as any).file; const b = req.body || {}; const e = { id: newId('EV'), caseId: b.caseId || newId('CASE'), type: b.type || 'DOCUMENT', fileName: f?.originalname || b.fileName || 'evidence', fileSize: f?.size || Number(b.fileSize) || 0, mimeType: f?.mimetype || b.mimeType || 'application/octet-stream', hash: crypto.createHash('sha256').update(f?.buffer || Buffer.from(JSON.stringify(b))).digest('hex'), hashAlgorithm: 'SHA-256', uploadedBy: current(req)?.name || 'System', uploadedAt: now(), status: 'ANALYZED', integrityVerified: true, extractedEntities: 0, extractedIndicators: 0 }; store.evidence.unshift(e); save(); audit(req, 'CREATE', 'evidence', e.id); return ok(res, e, 201); });
api.get('/entities', allow('INVESTIGATOR','ANALYST'), (req, res) => ok(res, paginate(store.entities.filter((x) => (!req.query.type || x.type === req.query.type) && (!req.query.search || JSON.stringify(x).toLowerCase().includes(String(req.query.search).toLowerCase()))), req)));
api.get('/entities/:id', allow('INVESTIGATOR','ANALYST'), (req, res) => { const x = found(res, 'entities', String(req.params.id)); return x ? ok(res, x) : undefined; });
api.get('/findings', allow('INVESTIGATOR','ANALYST','REVIEWER'), (req, res) => ok(res, paginate(store.findings.filter((x) => (!req.query.caseId || x.caseId === req.query.caseId) && (!req.query.status || x.status === req.query.status)), req)));
api.patch('/findings/:id', allow('REVIEWER','INVESTIGATOR'), (req, res) => { const x = found(res, 'findings', String(req.params.id)); if (!x) return; Object.assign(x, { status: req.body.status, reviewedBy: current(req)?.name, reviewedAt: now(), reviewNotes: req.body.notes }); save(); audit(req, 'REVIEW', 'finding', x.id); return ok(res, x); });
api.get('/reports', allow('REPORTER','INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (req, res) => ok(res, paginate(store.reports.filter((x) => (!req.query.status || x.status === req.query.status) && (!req.query.riskLevel || x.riskLevel === req.query.riskLevel) && (current(req)?.role !== 'REPORTER' || x.reporterId === current(req)?.id)), req)));
api.get('/reports/:id', allow('REPORTER','INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (req, res) => { const x = found(res, 'reports', String(req.params.id)); return x ? ok(res, x) : undefined; });
api.post('/reports', allow('REPORTER','INVESTIGATOR'), (req, res) => { const r = { id: newId('SEN'), reporterId: current(req)?.id, reportDate: now(), status: 'PROCESSING', riskLevel: 'MEDIUM', riskScore: 0, detectedEntities: [], riskIndicators: [], recommendations: [], ...req.body }; store.reports.unshift(r); save(); audit(req, 'CREATE', 'report', r.id); return ok(res, r, 201); });
api.get('/transactions', allow('INVESTIGATOR','ANALYST'), (req, res) => ok(res, paginate(store.transactions.filter((x) => (!req.query.caseId || x.caseId === req.query.caseId) && (req.query.flagged === undefined || x.flagged === (req.query.flagged === 'true'))), req)));
api.patch('/transactions/:id', allow('INVESTIGATOR','ANALYST'), (req, res) => { const x = found(res, 'transactions', String(req.params.id)); if (!x) return; x.status = req.body.status; save(); audit(req, 'UPDATE', 'transaction', x.id); return ok(res, x); });
api.get('/threat-intelligence', allow('INVESTIGATOR','ANALYST'), (req, res) => ok(res, paginate(store.threatIntel.filter((x) => (!req.query.reputation || x.reputation === req.query.reputation) && (!req.query.search || JSON.stringify(x).toLowerCase().includes(String(req.query.search).toLowerCase()))), req)));
api.get('/audit-logs', allow('AUDITOR','ADMIN'), (req, res) => ok(res, paginate(store.auditLogs, req)));
api.get('/dashboard', allow('INVESTIGATOR','ANALYST','REVIEWER','AUDITOR'), (_req, res) => ok(res, { cases: store.cases.length, openCases: store.cases.filter((x) => !['RESOLVED','CLOSED'].includes(x.status)).length, reports: store.reports.length, evidence: store.evidence.length, findings: store.findings.length, highRiskCases: store.cases.filter((x) => ['HIGH','CRITICAL'].includes(x.severity)).length }));
app.use('/api/v1', api); app.use((_req, res) => fail(res, 404, 'Route not found', 'NOT_FOUND')); app.use((err: any, _req: Request, res: Response, _next: NextFunction) => { console.error(err); return fail(res, err.code === 'LIMIT_FILE_SIZE' ? 413 : 500, err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 25MB limit' : 'Internal server error', 'INTERNAL_ERROR'); });
export default app;
