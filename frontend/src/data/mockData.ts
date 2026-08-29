import type {
  Case, Evidence, Entity, Finding, Transaction, ThreatIntel,
  AIAgent, AuditLog, Report, User, Notification,
  DetectedEntity, RiskIndicator, GraphNode, GraphEdge,
} from '../types';
import {
  UserRole, Permission, Severity, CaseStatus, EvidenceType, EvidenceStatus,
  EntityType, RiskLevel, FindingStatus, ReportStatus, TransactionStatus,
} from '../types';

// ─── Users ───────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: 'USR-001', name: 'Rahul Sharma', email: 'rahul.sharma@sentinel.gov',
    role: UserRole.INVESTIGATOR, status: 'active', lastLogin: '2026-08-28T14:30:00Z',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlUYUgyE_9gWQXk7JI7wLe8IG8h3pOdzS_7RZ75BOD3Bj251cJImmDlyoarpJZofPH7YzU4BuHaof6BMrfIFp_7vDiitq-v7FKCmmsGuaA1akVK9eWTDQlqQYXP31ETNV9VCt4gJ3dG4E1uOniqdBijULRABhL7aXBcw5tkO--reXY3yP4xsbJxwyMvLAjfej2kVE_F2ZnPX8z78jXQmnqB0XRW8wf3x7ULVVCa6TylXtUt6CVMWYt',
    permissions: [Permission.VIEW_ALL_CASES, Permission.MANAGE_CASES, Permission.VIEW_EVIDENCE, Permission.VIEW_ENTITIES, Permission.VIEW_GRAPH, Permission.VIEW_THREAT_INTEL, Permission.VIEW_FINANCIAL, Permission.VIEW_FINDINGS, Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS, Permission.VIEW_AI_AGENTS, Permission.VIEW_TIMELINE],
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'USR-002', name: 'Priya Patel', email: 'priya.patel@sentinel.gov',
    role: UserRole.ANALYST, status: 'active', lastLogin: '2026-08-28T11:15:00Z',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ7_z02Po0cQaGr6IcRZkCqmRsVLral0re1naiN1V59oHth0ZsEL-zPiS_CTwnPGn24YAkkkaCTeikhamFYt1QjiTGXCwckOUFtYX8YFZKaVJV5bqRK0-19-3i8Twj_amtQ1ztIEg3rWvyqvw2p9c2QHTUUQf_V2bf03A8oKi-Surk3a9A9WZY-z22o252OoAzm5AXByEcrFvsjfYOcJ58NPT3awaTJnwns5mbMlWnzZqzw4FMFAsk',
    permissions: [Permission.VIEW_ALL_CASES, Permission.VIEW_EVIDENCE, Permission.VIEW_ENTITIES, Permission.VIEW_GRAPH, Permission.VIEW_THREAT_INTEL, Permission.VIEW_FINANCIAL, Permission.VIEW_FINDINGS, Permission.VIEW_REPORTS],
    createdAt: '2025-03-20T10:00:00Z',
  },
  {
    id: 'USR-003', name: 'Ankit Verma', email: 'ankit.verma@sentinel.gov',
    role: UserRole.REVIEWER, status: 'active', lastLogin: '2026-08-28T09:45:00Z',
    permissions: [Permission.VIEW_ALL_CASES, Permission.VIEW_EVIDENCE, Permission.VIEW_FINDINGS, Permission.REVIEW_FINDINGS, Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS],
    createdAt: '2025-05-10T10:00:00Z',
  },
  {
    id: 'USR-004', name: 'Meera Singh', email: 'meera.singh@sentinel.gov',
    role: UserRole.AUDITOR, status: 'active', lastLogin: '2026-08-27T16:00:00Z',
    permissions: [Permission.VIEW_AUDIT_LOGS, Permission.VIEW_ALL_CASES, Permission.VIEW_REPORTS],
    createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 'USR-005', name: 'Suresh Kumar', email: 'suresh.kumar@sentinel.gov',
    role: UserRole.ADMIN, status: 'active', lastLogin: '2026-08-28T15:00:00Z',
    permissions: Object.values(Permission),
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'USR-006', name: 'Sarah Jenkins', email: 'sarah.j@sentinel.gov',
    role: UserRole.INVESTIGATOR, status: 'active', lastLogin: '2026-08-28T13:00:00Z',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ7_z02Po0cQaGr6IcRZkCqmRsVLral0re1naiN1V59oHth0ZsEL-zPiS_CTwnPGn24YAkkkaCTeikhamFYt1QjiTGXCwckOUFtYX8YFZKaVJV5bqRK0-19-3i8Twj_amtQ1ztIEg3rWvyqvw2p9c2QHTUUQf_V2bf03A8oKi-Surk3a9A9WZY-z22o252OoAzm5AXByEcrFvsjfYOcJ58NPT3awaTJnwns5mbMlWnzZqzw4FMFAsk',
    permissions: [Permission.VIEW_ALL_CASES, Permission.MANAGE_CASES, Permission.VIEW_EVIDENCE, Permission.VIEW_ENTITIES, Permission.VIEW_GRAPH, Permission.VIEW_THREAT_INTEL, Permission.VIEW_FINANCIAL, Permission.VIEW_FINDINGS, Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS, Permission.VIEW_AI_AGENTS, Permission.VIEW_TIMELINE],
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'USR-007', name: 'David Chen', email: 'david.c@sentinel.gov',
    role: UserRole.INVESTIGATOR, status: 'active', lastLogin: '2026-08-28T12:30:00Z',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsNYeREojATsjvV8L_zEAyMmfbqKWVNYzuNK7t_nZLt6kULnstPl7juFdFiQ1bZE695NpMhdaMCNyy_sNHgXYzHfSgoxFDpEPZL4t1ysZCm-KSsNz3hJqlDwHM4FsGnHRVLpfPnkaUzoRixl2MnSvDAqiecTxfYjoxGw7c92LhC5WRQBac6896hASoeC2VR23x1qUxv8WEOli99GGSuuZsrHldEPe3BbtFDCvQXvCKaD8zlptEHyam',
    permissions: [Permission.VIEW_ALL_CASES, Permission.MANAGE_CASES, Permission.VIEW_EVIDENCE, Permission.VIEW_ENTITIES, Permission.VIEW_GRAPH, Permission.VIEW_THREAT_INTEL, Permission.VIEW_FINANCIAL, Permission.VIEW_FINDINGS, Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS, Permission.VIEW_AI_AGENTS, Permission.VIEW_TIMELINE],
    createdAt: '2025-04-05T10:00:00Z',
  },
  {
    id: 'USR-008', name: 'Lakshmi Nair', email: 'lakshmi.n@sentinel.gov',
    role: UserRole.ANALYST, status: 'inactive', lastLogin: '2026-07-15T10:00:00Z',
    permissions: [Permission.VIEW_ALL_CASES, Permission.VIEW_FINANCIAL, Permission.VIEW_THREAT_INTEL],
    createdAt: '2025-07-20T10:00:00Z',
  },
];

// ─── Cases ───────────────────────────────────────────────────

export const mockCases: Case[] = [
  {
    id: 'CASE-1021', title: 'P2P UPI Mule Network Analysis', description: 'Investigation into a network of mule accounts used for layering funds obtained through UPI fraud targeting retail customers across Maharashtra and Gujarat.',
    severity: Severity.HIGH, status: CaseStatus.INVESTIGATING, assignedTo: mockUsers[0], assignedToId: 'USR-001',
    riskScore: 92, evidenceCount: 12, entityCount: 19, findingCount: 8, transactionCount: 6, relatedCaseCount: 3,
    createdAt: '2026-08-20T08:00:00Z', updatedAt: '2026-08-28T14:30:00Z',
    tags: ['UPI', 'Mule Network', 'Financial Fraud'],
    aiSummary: 'This case involves a coordinated network of 5+ mule accounts used to layer approximately ₹12.8L in funds obtained through UPI fraud. The network shows characteristics of a Level 1 collector operation with rapid fund movement patterns. Multiple victim accounts across 3 banks have been identified. The primary UPI ID (fraudster@example) shows high-velocity transactional behavior typical of collector mules, with 142 transactions in the last 24 hours.',
  },
  {
    id: 'CASE-1022', title: 'Insider Threat: Unauthorized Data Exfiltration', description: 'Detection of unusual data access patterns and potential unauthorized data exfiltration from internal systems.',
    severity: Severity.CRITICAL, status: CaseStatus.ESCALATED, assignedTo: mockUsers[6], assignedToId: 'USR-007',
    riskScore: 96, evidenceCount: 8, entityCount: 14, findingCount: 6, transactionCount: 0, relatedCaseCount: 1,
    createdAt: '2026-08-22T10:00:00Z', updatedAt: '2026-08-28T13:15:00Z',
    tags: ['Insider Threat', 'Data Exfiltration', 'Critical'],
    aiSummary: 'Unusual data access patterns detected from internal employee account. Large volume of sensitive records accessed outside normal business hours with subsequent external transfer attempts.',
  },
  {
    id: 'CASE-1023', title: 'Ransomware Payload Analysis (LockBit)', description: 'Analysis of suspected LockBit ransomware variant targeting financial sector organizations.',
    severity: Severity.MEDIUM, status: CaseStatus.UNDER_REVIEW,
    riskScore: 78, evidenceCount: 5, entityCount: 8, findingCount: 4, transactionCount: 2, relatedCaseCount: 5,
    createdAt: '2026-08-18T14:00:00Z', updatedAt: '2026-08-28T10:00:00Z',
    tags: ['Ransomware', 'LockBit', 'Malware'],
  },
  {
    id: 'CASE-1024', title: 'Phishing Campaign - HDFC Impersonation', description: 'Large-scale phishing campaign impersonating HDFC Bank targeting customers via SMS and email.',
    severity: Severity.HIGH, status: CaseStatus.INVESTIGATING, assignedTo: mockUsers[5], assignedToId: 'USR-006',
    riskScore: 88, evidenceCount: 15, entityCount: 22, findingCount: 10, transactionCount: 8, relatedCaseCount: 4,
    createdAt: '2026-08-15T09:00:00Z', updatedAt: '2026-08-28T11:00:00Z',
    tags: ['Phishing', 'Banking', 'SMS Fraud'],
    aiSummary: 'Coordinated phishing campaign using spoofed HDFC Bank communications. 15+ unique phishing domains identified with active credential harvesting.',
  },
  {
    id: 'CASE-1025', title: 'Crypto Investment Scam Network', description: 'Investigation of a pig butchering crypto investment scam operating through WhatsApp and Telegram.',
    severity: Severity.HIGH, status: CaseStatus.INVESTIGATING, assignedTo: mockUsers[0], assignedToId: 'USR-001',
    riskScore: 85, evidenceCount: 20, entityCount: 35, findingCount: 12, transactionCount: 15, relatedCaseCount: 7,
    createdAt: '2026-08-10T11:00:00Z', updatedAt: '2026-08-27T16:00:00Z',
    tags: ['Crypto', 'Investment Scam', 'Social Engineering'],
  },
  {
    id: 'CASE-1026', title: 'SIM Swap Fraud - Telecom Investigation', description: 'Multiple SIM swap attacks targeting high-value bank accounts through compromised telecom operator processes.',
    severity: Severity.CRITICAL, status: CaseStatus.INVESTIGATING, assignedTo: mockUsers[6], assignedToId: 'USR-007',
    riskScore: 94, evidenceCount: 7, entityCount: 11, findingCount: 5, transactionCount: 4, relatedCaseCount: 2,
    createdAt: '2026-08-25T08:00:00Z', updatedAt: '2026-08-28T15:00:00Z',
    tags: ['SIM Swap', 'Telecom', 'Identity Theft'],
  },
  {
    id: 'CASE-1027', title: 'Fake Customer Support Scam', description: 'Investigation into fraudulent customer support numbers being advertised through search engine ads.',
    severity: Severity.MEDIUM, status: CaseStatus.OPEN,
    riskScore: 65, evidenceCount: 4, entityCount: 6, findingCount: 3, transactionCount: 1, relatedCaseCount: 0,
    createdAt: '2026-08-26T14:00:00Z', updatedAt: '2026-08-28T09:00:00Z',
    tags: ['Customer Support', 'Search Ads', 'Social Engineering'],
  },
  {
    id: 'CASE-1028', title: 'QR Code Payment Redirect Fraud', description: 'Modified QR codes at merchant locations redirecting payments to fraudulent accounts.',
    severity: Severity.MEDIUM, status: CaseStatus.INVESTIGATING, assignedTo: mockUsers[1], assignedToId: 'USR-002',
    riskScore: 72, evidenceCount: 9, entityCount: 13, findingCount: 5, transactionCount: 7, relatedCaseCount: 1,
    createdAt: '2026-08-19T10:00:00Z', updatedAt: '2026-08-27T14:00:00Z',
    tags: ['QR Code', 'Payment Redirect', 'Merchant Fraud'],
  },
  {
    id: 'CASE-1029', title: 'Loan App Harassment & Data Theft', description: 'Investigation of predatory lending apps that harvest user data and engage in harassment for repayment.',
    severity: Severity.HIGH, status: CaseStatus.UNDER_REVIEW, assignedTo: mockUsers[2], assignedToId: 'USR-003',
    riskScore: 82, evidenceCount: 18, entityCount: 25, findingCount: 9, transactionCount: 10, relatedCaseCount: 6,
    createdAt: '2026-08-12T09:00:00Z', updatedAt: '2026-08-28T08:00:00Z',
    tags: ['Loan App', 'Harassment', 'Data Theft', 'Privacy'],
  },
  {
    id: 'CASE-1030', title: 'Government Scheme Impersonation', description: 'Fraudulent websites and WhatsApp messages impersonating PM-KISAN and other government schemes.',
    severity: Severity.LOW, status: CaseStatus.RESOLVED, assignedTo: mockUsers[5], assignedToId: 'USR-006',
    riskScore: 45, evidenceCount: 6, entityCount: 9, findingCount: 4, transactionCount: 3, relatedCaseCount: 2,
    createdAt: '2026-08-05T10:00:00Z', updatedAt: '2026-08-25T16:00:00Z',
    tags: ['Government', 'Impersonation', 'WhatsApp'],
  },
  {
    id: 'CASE-1031', title: 'ATM Skimming Ring - Delhi NCR', description: 'Physical ATM card skimming devices found across multiple ATMs in Delhi NCR region.',
    severity: Severity.HIGH, status: CaseStatus.CLOSED, assignedTo: mockUsers[0], assignedToId: 'USR-001',
    riskScore: 88, evidenceCount: 14, entityCount: 20, findingCount: 7, transactionCount: 12, relatedCaseCount: 3,
    createdAt: '2026-07-15T10:00:00Z', updatedAt: '2026-08-20T10:00:00Z',
    tags: ['ATM', 'Skimming', 'Physical Fraud'],
  },
  {
    id: 'CASE-1032', title: 'Deepfake Video Call Scam', description: 'Use of deepfake technology in video calls to impersonate executives for wire transfer authorization.',
    severity: Severity.CRITICAL, status: CaseStatus.OPEN,
    riskScore: 91, evidenceCount: 3, entityCount: 5, findingCount: 2, transactionCount: 1, relatedCaseCount: 0,
    createdAt: '2026-08-27T16:00:00Z', updatedAt: '2026-08-28T10:00:00Z',
    tags: ['Deepfake', 'Video Call', 'Executive Fraud', 'AI-Enabled'],
  },
];

// ─── Evidence ────────────────────────────────────────────────

export const mockEvidence: Evidence[] = [
  {
    id: 'EV-001', caseId: 'CASE-1021', type: EvidenceType.IMAGE, fileName: 'Txn_Proof_0921.png', fileSize: 2457600,
    mimeType: 'image/png', hash: 'a93f7b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e82d1', hashAlgorithm: 'SHA-256',
    uploadedBy: 'Reporter', uploadedAt: '2026-08-28T10:42:00Z', status: EvidenceStatus.VERIFIED,
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf3YavfUe_bKcsE5OaIK9wqs8Qh8ErfcUIHP6IrfmaSSiNmy3ZM1xRcY8eImNCCD2za8ekUUCspRgCXgtoizyd0vX9Uk5KraF3RuLLfFWNdDIZyyOg8DFgKfBEtHPa2r9fcXd8bJb3LmMz4I1YbBmwp-E8aiZU7GnngxeJ98rYvo23QdIUpHl2y2Mg1o_zBumGGl-r1DYhXbFmdETm5gOXD7spKPFqDg9BHDcOczct9CNfRpzOYWwN',
    integrityVerified: true, extractedEntities: 4, extractedIndicators: 3,
  },
  {
    id: 'EV-002', caseId: 'CASE-1021', type: EvidenceType.PDF, fileName: 'Bank_Statement_HDFC.pdf', fileSize: 1048576,
    mimeType: 'application/pdf', hash: 'b84e9c3d2f1a0b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c', hashAlgorithm: 'SHA-256',
    uploadedBy: 'Rahul Sharma', uploadedAt: '2026-08-27T14:15:00Z', status: EvidenceStatus.VERIFIED,
    integrityVerified: true, extractedEntities: 8, extractedIndicators: 5,
  },
  {
    id: 'EV-003', caseId: 'CASE-1021', type: EvidenceType.LOG, fileName: 'Firewall_Extract_IP_Block.csv', fileSize: 524288,
    mimeType: 'text/csv', hash: 'c75f0d4e3a2b1c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b90ab', hashAlgorithm: 'SHA-256',
    uploadedBy: 'System', uploadedAt: '2026-08-12T09:30:00Z', status: EvidenceStatus.ANALYZED,
    integrityVerified: true, extractedEntities: 142, extractedIndicators: 18,
  },
  {
    id: 'EV-004', caseId: 'CASE-1024', type: EvidenceType.IMAGE, fileName: 'Phishing_Email_Screenshot.png', fileSize: 3145728,
    mimeType: 'image/png', hash: 'd66a1e5f4b3c2d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e', hashAlgorithm: 'SHA-256',
    uploadedBy: 'Reporter', uploadedAt: '2026-08-15T09:10:00Z', status: EvidenceStatus.VERIFIED,
    integrityVerified: true, extractedEntities: 6, extractedIndicators: 8,
  },
  {
    id: 'EV-005', caseId: 'CASE-1024', type: EvidenceType.URL, fileName: 'hdfc-secure-login.fraudsite.com', fileSize: 0,
    mimeType: 'text/uri-list', hash: 'e57b2f6a5c4d3e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f', hashAlgorithm: 'SHA-256',
    uploadedBy: 'Reporter', uploadedAt: '2026-08-15T09:12:00Z', status: EvidenceStatus.ANALYZED,
    integrityVerified: true, extractedEntities: 3, extractedIndicators: 12,
  },
  {
    id: 'EV-006', caseId: 'CASE-1025', type: EvidenceType.MESSAGE, fileName: 'WhatsApp_Chat_Export.txt', fileSize: 102400,
    mimeType: 'text/plain', hash: 'f48c3a7b6d5e4f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a', hashAlgorithm: 'SHA-256',
    uploadedBy: 'Reporter', uploadedAt: '2026-08-10T11:30:00Z', status: EvidenceStatus.VERIFIED,
    integrityVerified: true, extractedEntities: 12, extractedIndicators: 7,
  },
  {
    id: 'EV-007', caseId: 'CASE-1028', type: EvidenceType.QR_CODE, fileName: 'Modified_QR_Merchant.png', fileSize: 1572864,
    mimeType: 'image/png', hash: 'a39d4b8c7e6f5a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b', hashAlgorithm: 'SHA-256',
    uploadedBy: 'Investigator', uploadedAt: '2026-08-19T10:20:00Z', status: EvidenceStatus.VERIFIED,
    integrityVerified: true, extractedEntities: 2, extractedIndicators: 4,
  },
  {
    id: 'EV-008', caseId: 'CASE-1021', type: EvidenceType.TRANSACTION, fileName: 'UPI_Transaction_Log.json', fileSize: 204800,
    mimeType: 'application/json', hash: 'b20e5c9d8f7a6b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c', hashAlgorithm: 'SHA-256',
    uploadedBy: 'System', uploadedAt: '2026-08-28T08:00:00Z', status: EvidenceStatus.VERIFIED,
    integrityVerified: true, extractedEntities: 15, extractedIndicators: 9,
  },
];

// ─── Entities ────────────────────────────────────────────────

export const mockEntities: Entity[] = [
  { id: 'ENT-001', type: EntityType.UPI, value: 'fraudster@example', displayName: 'fraudster@example', confidence: 94, riskScore: 94, caseCount: 7, firstSeen: '2026-08-14T08:22:00Z', lastSeen: '2026-08-28T14:05:00Z', metadata: { provider: 'PayTM Payments Bank', linkedName: 'Sharma Electronics' }, relatedEntityIds: ['ENT-002', 'ENT-003', 'ENT-005'] },
  { id: 'ENT-002', type: EntityType.BANK_ACCOUNT, value: '9928xxxx1120', displayName: 'HDFC Account ****1120', confidence: 98, riskScore: 45, caseCount: 2, firstSeen: '2026-08-20T10:00:00Z', lastSeen: '2026-08-28T12:00:00Z', metadata: { bank: 'HDFC Bank', branch: 'Mumbai Main', ifsc: 'HDFC0000001' }, relatedEntityIds: ['ENT-001'] },
  { id: 'ENT-003', type: EntityType.BANK_ACCOUNT, value: 'Mule Acc #441', displayName: 'Mule Account #441', confidence: 91, riskScore: 92, caseCount: 4, firstSeen: '2026-08-10T08:00:00Z', lastSeen: '2026-08-28T14:00:00Z', metadata: { bank: 'ICICI Bank', branch: 'Mumbai Main', ifsc: 'ICIC0000001', status: 'Frozen', balance: '₹1,200' }, relatedEntityIds: ['ENT-001', 'ENT-004'] },
  { id: 'ENT-004', type: EntityType.PERSON, value: 'VIC-88921', displayName: 'Victim Account (VIC-88921)', confidence: 99, riskScore: 10, caseCount: 1, firstSeen: '2026-08-20T10:00:00Z', lastSeen: '2026-08-28T10:42:00Z', metadata: { loss: '₹45,000', bank: 'SBI' }, relatedEntityIds: ['ENT-001'] },
  { id: 'ENT-005', type: EntityType.IP_ADDRESS, value: '103.44.xx.xx', displayName: '103.44.xx.xx (Proxy)', confidence: 87, riskScore: 88, caseCount: 3, firstSeen: '2026-08-14T08:22:00Z', lastSeen: '2026-08-28T14:05:00Z', metadata: { type: 'PROXY', geo: 'Mumbai, IN', asn: 'AS-EXAMPLE' }, relatedEntityIds: ['ENT-001'] },
  { id: 'ENT-006', type: EntityType.DOMAIN, value: 'hdfc-secure-login.fraudsite.com', displayName: 'hdfc-secure-login.fraudsite.com', confidence: 96, riskScore: 95, caseCount: 4, firstSeen: '2026-08-12T06:00:00Z', lastSeen: '2026-08-28T08:00:00Z', metadata: { registrar: 'NameCheap', age: '14 days', ssl: 'Let\'s Encrypt' }, relatedEntityIds: ['ENT-007', 'ENT-008'] },
  { id: 'ENT-007', type: EntityType.EMAIL, value: 'support@hdfc-secure.com', displayName: 'support@hdfc-secure.com', confidence: 92, riskScore: 90, caseCount: 3, firstSeen: '2026-08-13T10:00:00Z', lastSeen: '2026-08-27T14:00:00Z', metadata: { provider: 'ProtonMail' }, relatedEntityIds: ['ENT-006'] },
  { id: 'ENT-008', type: EntityType.PHONE, value: '+91 98XXX XXXXX', displayName: '+91 98XXX XXXXX', confidence: 85, riskScore: 78, caseCount: 2, firstSeen: '2026-08-15T09:00:00Z', lastSeen: '2026-08-25T16:00:00Z', metadata: { carrier: 'Jio', type: 'Mobile' }, relatedEntityIds: ['ENT-006', 'ENT-007'] },
  { id: 'ENT-009', type: EntityType.WALLET, value: 'bc1q...x9f2', displayName: 'Bitcoin Wallet (bc1q...x9f2)', confidence: 80, riskScore: 85, caseCount: 5, firstSeen: '2026-07-01T10:00:00Z', lastSeen: '2026-08-28T06:00:00Z', metadata: { type: 'Bitcoin', totalReceived: '2.4 BTC' }, relatedEntityIds: ['ENT-010'] },
  { id: 'ENT-010', type: EntityType.ORGANIZATION, value: 'CryptoTrade Pro', displayName: 'CryptoTrade Pro (Fake Exchange)', confidence: 88, riskScore: 92, caseCount: 7, firstSeen: '2026-06-15T10:00:00Z', lastSeen: '2026-08-28T10:00:00Z', metadata: { type: 'Fake Exchange', website: 'cryptotradepro.xyz' }, relatedEntityIds: ['ENT-009'] },
  { id: 'ENT-011', type: EntityType.IP_ADDRESS, value: '45.22.xx.xx', displayName: '45.22.xx.xx', confidence: 75, riskScore: 60, caseCount: 1, firstSeen: '2026-08-20T12:00:00Z', lastSeen: '2026-08-28T14:05:00Z', metadata: { geo: 'Delhi, IN', asn: 'AS-EXAMPLE2' }, relatedEntityIds: ['ENT-001'] },
  { id: 'ENT-012', type: EntityType.DEVICE, value: 'DEV-Android-8821', displayName: 'Android Device (Samsung SM-A53)', confidence: 82, riskScore: 55, caseCount: 1, firstSeen: '2026-08-20T10:42:00Z', lastSeen: '2026-08-28T14:05:00Z', metadata: { os: 'Android 13', model: 'Samsung SM-A53' }, relatedEntityIds: ['ENT-001', 'ENT-005'] },
];

// ─── Findings ────────────────────────────────────────────────

export const mockFindings: Finding[] = [
  { id: 'FND-101', caseId: 'CASE-1021', title: 'Phishing Attempt Detected', description: 'Domain mismatch combined with credential request and urgency language detected in SMS message.', severity: Severity.HIGH, confidence: 94, status: FindingStatus.PENDING, evidenceIds: ['EV-001', 'EV-003'], agentName: 'Threat Agent', reason: 'Domain mismatch + credential request + urgency language.', createdAt: '2026-08-28T10:45:00Z' },
  { id: 'FND-102', caseId: 'CASE-1021', title: 'Money Mule Account Identified', description: 'Account #441 shows characteristics of a Level 1 collector mule with rapid fund movement.', severity: Severity.HIGH, confidence: 88, status: FindingStatus.ACCEPTED, evidenceIds: ['EV-002', 'EV-008'], agentName: 'Financial Agent', reason: 'High-velocity transactions, multiple small deposits, rapid withdrawal pattern.', reviewedBy: 'Priya Patel', reviewedAt: '2026-08-28T11:30:00Z', reviewNotes: 'Confirmed mule pattern. Account has been flagged for suspension.', createdAt: '2026-08-28T10:50:00Z' },
  { id: 'FND-103', caseId: 'CASE-1021', title: 'Suspicious Domain Registration', description: 'Domain registered 14 days ago with privacy protection. SSL certificate from Let\'s Encrypt.', severity: Severity.MEDIUM, confidence: 81, status: FindingStatus.ACCEPTED, evidenceIds: ['EV-005'], agentName: 'Threat Agent', reason: 'New domain, privacy protection, free SSL, similar to known phishing pattern.', reviewedBy: 'Ankit Verma', reviewedAt: '2026-08-28T12:00:00Z', createdAt: '2026-08-28T10:52:00Z' },
  { id: 'FND-104', caseId: 'CASE-1021', title: 'Proxy IP Usage Detected', description: 'Entity connected via known proxy IP address associated with 3 previous fraud cases.', severity: Severity.MEDIUM, confidence: 87, status: FindingStatus.PENDING, evidenceIds: ['EV-003'], agentName: 'Graph Agent', reason: 'IP 103.44.xx.xx flagged as proxy, linked to ThreatCluster-Alpha.', createdAt: '2026-08-28T10:55:00Z' },
  { id: 'FND-105', caseId: 'CASE-1024', title: 'Credential Harvesting Page', description: 'Phishing page designed to harvest HDFC Bank login credentials.', severity: Severity.CRITICAL, confidence: 97, status: FindingStatus.ACCEPTED, evidenceIds: ['EV-004', 'EV-005'], agentName: 'Evidence Agent', reason: 'Page mimics HDFC login portal with credential capture form submitting to external server.', reviewedBy: 'Rahul Sharma', reviewedAt: '2026-08-15T14:00:00Z', createdAt: '2026-08-15T09:30:00Z' },
  { id: 'FND-106', caseId: 'CASE-1025', title: 'Pig Butchering Pattern', description: 'Classic pig butchering investment scam progression identified in chat logs.', severity: Severity.HIGH, confidence: 91, status: FindingStatus.ACCEPTED, evidenceIds: ['EV-006'], agentName: 'Evidence Agent', reason: 'Romance building → Trust → Small investment → Large investment → Loss pattern.', reviewedBy: 'Priya Patel', reviewedAt: '2026-08-11T10:00:00Z', createdAt: '2026-08-10T14:00:00Z' },
  { id: 'FND-107', caseId: 'CASE-1021', title: 'Transaction Velocity Anomaly', description: '142 transactions in 24 hours from single UPI ID exceeds normal patterns by 20x.', severity: Severity.HIGH, confidence: 95, status: FindingStatus.PENDING, evidenceIds: ['EV-008'], agentName: 'Financial Agent', reason: 'Average UPI ID processes 7 transactions/day. This entity processed 142 in 24 hours.', createdAt: '2026-08-28T11:00:00Z' },
  { id: 'FND-108', caseId: 'CASE-1028', title: 'QR Code Tampering', description: 'QR code at merchant location modified to redirect payments to unauthorized account.', severity: Severity.MEDIUM, confidence: 89, status: FindingStatus.ACCEPTED, evidenceIds: ['EV-007'], agentName: 'Evidence Agent', reason: 'QR code decoded to UPI ID not matching registered merchant. Physical overlay detected.', reviewedBy: 'Ankit Verma', reviewedAt: '2026-08-20T10:00:00Z', createdAt: '2026-08-19T11:00:00Z' },
  { id: 'FND-109', caseId: 'CASE-1021', title: 'Network Hub Entity', description: 'Entity fraudster@example acts as a hub connecting 19 entities across 7 cases.', severity: Severity.HIGH, confidence: 92, status: FindingStatus.NEEDS_REVIEW, evidenceIds: ['EV-001', 'EV-002', 'EV-003'], agentName: 'Graph Agent', reason: 'High degree centrality (0.89) in entity graph. Connected to multiple confirmed fraud cases.', createdAt: '2026-08-28T11:10:00Z' },
  { id: 'FND-110', caseId: 'CASE-1022', title: 'Unusual Data Access Pattern', description: 'Employee accessed 12,000+ records outside business hours over 3 consecutive nights.', severity: Severity.CRITICAL, confidence: 93, status: FindingStatus.PENDING, evidenceIds: [], agentName: 'Evidence Agent', reason: 'Access volume 50x normal. Occurred between 1:00-4:00 AM. Records exported to personal device.', createdAt: '2026-08-22T10:30:00Z' },
];

// ─── Transactions ────────────────────────────────────────────

export const mockTransactions: Transaction[] = [
  { id: 'TXN-001', caseId: 'CASE-1021', timestamp: '2026-08-28T10:31:00Z', sender: 'VIC-88921 (Victim)', senderType: EntityType.PERSON, receiver: 'fraudster@example', receiverType: EntityType.UPI, amount: 45000, currency: 'INR', method: 'UPI', status: TransactionStatus.COMPLETED, riskScore: 92, flagged: true },
  { id: 'TXN-002', caseId: 'CASE-1021', timestamp: '2026-08-28T10:32:00Z', sender: 'fraudster@example', senderType: EntityType.UPI, receiver: 'Mule Acc #441', receiverType: EntityType.BANK_ACCOUNT, amount: 44800, currency: 'INR', method: 'UPI', status: TransactionStatus.COMPLETED, riskScore: 95, flagged: true, notes: 'Near-instant transfer. ₹200 retained as commission.' },
  { id: 'TXN-003', caseId: 'CASE-1021', timestamp: '2026-08-28T10:34:00Z', sender: 'Mule Acc #441', senderType: EntityType.BANK_ACCOUNT, receiver: 'ICICI Bank Ltd', receiverType: EntityType.BANK_ACCOUNT, amount: 44000, currency: 'INR', method: 'NEFT', status: TransactionStatus.COMPLETED, riskScore: 85, flagged: true },
  { id: 'TXN-004', caseId: 'CASE-1021', timestamp: '2026-08-28T10:41:00Z', sender: 'ICICI Bank Ltd', senderType: EntityType.BANK_ACCOUNT, receiver: 'bc1q...x9f2', receiverType: EntityType.WALLET, amount: 43500, currency: 'INR', method: 'P2P Exchange', status: TransactionStatus.COMPLETED, riskScore: 90, flagged: true },
  { id: 'TXN-005', caseId: 'CASE-1021', timestamp: '2026-08-28T10:48:00Z', sender: 'bc1q...x9f2', senderType: EntityType.WALLET, receiver: 'Unknown Wallet', receiverType: EntityType.WALLET, amount: 42000, currency: 'INR', method: 'Bitcoin', status: TransactionStatus.COMPLETED, riskScore: 88, flagged: true },
  { id: 'TXN-006', caseId: 'CASE-1021', timestamp: '2026-08-27T15:20:00Z', sender: 'VIC-88922', senderType: EntityType.PERSON, receiver: 'fraudster@example', receiverType: EntityType.UPI, amount: 25000, currency: 'INR', method: 'UPI', status: TransactionStatus.COMPLETED, riskScore: 88, flagged: true },
  { id: 'TXN-007', caseId: 'CASE-1024', timestamp: '2026-08-16T14:30:00Z', sender: 'Victim-PH001', senderType: EntityType.PERSON, receiver: 'fake-hdfc@upi', receiverType: EntityType.UPI, amount: 75000, currency: 'INR', method: 'UPI', status: TransactionStatus.COMPLETED, riskScore: 90, flagged: true },
  { id: 'TXN-008', caseId: 'CASE-1024', timestamp: '2026-08-17T09:15:00Z', sender: 'Victim-PH002', senderType: EntityType.PERSON, receiver: 'fake-hdfc@upi', receiverType: EntityType.UPI, amount: 50000, currency: 'INR', method: 'UPI', status: TransactionStatus.COMPLETED, riskScore: 88, flagged: true },
  { id: 'TXN-009', caseId: 'CASE-1025', timestamp: '2026-08-11T10:00:00Z', sender: 'Victim-CR001', senderType: EntityType.PERSON, receiver: 'CryptoTrade Pro', receiverType: EntityType.ORGANIZATION, amount: 200000, currency: 'INR', method: 'Bank Transfer', status: TransactionStatus.COMPLETED, riskScore: 85, flagged: true },
  { id: 'TXN-010', caseId: 'CASE-1025', timestamp: '2026-08-15T14:00:00Z', sender: 'Victim-CR001', senderType: EntityType.PERSON, receiver: 'CryptoTrade Pro', receiverType: EntityType.ORGANIZATION, amount: 500000, currency: 'INR', method: 'Bank Transfer', status: TransactionStatus.COMPLETED, riskScore: 92, flagged: true },
  { id: 'TXN-011', caseId: 'CASE-1028', timestamp: '2026-08-19T11:30:00Z', sender: 'Merchant Customer', senderType: EntityType.PERSON, receiver: 'redirect@upi', receiverType: EntityType.UPI, amount: 1500, currency: 'INR', method: 'UPI QR', status: TransactionStatus.COMPLETED, riskScore: 72, flagged: true },
  { id: 'TXN-012', caseId: 'CASE-1028', timestamp: '2026-08-19T12:45:00Z', sender: 'Merchant Customer 2', senderType: EntityType.PERSON, receiver: 'redirect@upi', receiverType: EntityType.UPI, amount: 3200, currency: 'INR', method: 'UPI QR', status: TransactionStatus.COMPLETED, riskScore: 72, flagged: true },
  { id: 'TXN-013', caseId: 'CASE-1029', timestamp: '2026-08-12T09:00:00Z', sender: 'LoanApp User', senderType: EntityType.PERSON, receiver: 'QuickCash App', receiverType: EntityType.ORGANIZATION, amount: 8000, currency: 'INR', method: 'UPI', status: TransactionStatus.COMPLETED, riskScore: 65, flagged: false },
  { id: 'TXN-014', caseId: 'CASE-1026', timestamp: '2026-08-25T22:30:00Z', sender: 'SIM Swap Victim', senderType: EntityType.PERSON, receiver: 'Unknown Account', receiverType: EntityType.BANK_ACCOUNT, amount: 350000, currency: 'INR', method: 'NEFT', status: TransactionStatus.COMPLETED, riskScore: 96, flagged: true },
  { id: 'TXN-015', caseId: 'CASE-1025', timestamp: '2026-08-20T10:00:00Z', sender: 'Victim-CR002', senderType: EntityType.PERSON, receiver: 'CryptoTrade Pro', receiverType: EntityType.ORGANIZATION, amount: 150000, currency: 'INR', method: 'Bank Transfer', status: TransactionStatus.COMPLETED, riskScore: 82, flagged: true },
];

// ─── Threat Intelligence ─────────────────────────────────────

export const mockThreatIntel: ThreatIntel[] = [
  { id: 'TI-001', indicator: 'hdfc-secure-login.fraudsite.com', indicatorType: 'DOMAIN', reputation: RiskLevel.HIGH, threatMatches: 3, relatedCases: 5, source: 'SENTINEL AI', firstSeen: '2026-08-12T06:00:00Z', lastSeen: '2026-08-28T08:00:00Z', tags: ['Phishing', 'Banking'], description: 'Domain impersonating HDFC Bank login portal. Active credential harvesting detected.' },
  { id: 'TI-002', indicator: '103.44.xx.xx', indicatorType: 'IP', reputation: RiskLevel.HIGH, threatMatches: 8, relatedCases: 3, source: 'External Feed', firstSeen: '2026-07-01T10:00:00Z', lastSeen: '2026-08-28T14:05:00Z', tags: ['Proxy', 'Fraud'], description: 'Known proxy IP associated with multiple fraud operations in South Asia region.' },
  { id: 'TI-003', indicator: 'cryptotradepro.xyz', indicatorType: 'DOMAIN', reputation: RiskLevel.CRITICAL, threatMatches: 12, relatedCases: 7, source: 'SENTINEL AI', firstSeen: '2026-06-15T10:00:00Z', lastSeen: '2026-08-28T10:00:00Z', tags: ['Crypto Scam', 'Pig Butchering'], description: 'Fake cryptocurrency exchange platform used in pig butchering investment scams.' },
  { id: 'TI-004', indicator: 'support@hdfc-secure.com', indicatorType: 'EMAIL', reputation: RiskLevel.HIGH, threatMatches: 5, relatedCases: 3, source: 'SENTINEL AI', firstSeen: '2026-08-13T10:00:00Z', lastSeen: '2026-08-27T14:00:00Z', tags: ['Phishing', 'Impersonation'], description: 'Email address used in phishing campaigns impersonating HDFC Bank customer support.' },
  { id: 'TI-005', indicator: '45.22.xx.xx', indicatorType: 'IP', reputation: RiskLevel.MEDIUM, threatMatches: 2, relatedCases: 1, source: 'External Feed', firstSeen: '2026-08-20T12:00:00Z', lastSeen: '2026-08-28T14:05:00Z', tags: ['Suspicious'], description: 'IP address associated with suspicious login activity from Delhi region.' },
  { id: 'TI-006', indicator: 'quickcash-loans.app', indicatorType: 'DOMAIN', reputation: RiskLevel.HIGH, threatMatches: 6, relatedCases: 6, source: 'RBI Advisory', firstSeen: '2026-05-01T10:00:00Z', lastSeen: '2026-08-28T08:00:00Z', tags: ['Loan App', 'Harassment', 'Data Theft'], description: 'Predatory lending application flagged by RBI for unauthorized data collection and harassment.' },
];

// ─── AI Agents ───────────────────────────────────────────────

export const mockAIAgents: AIAgent[] = [
  { id: 'AG-001', name: 'Evidence Agent', description: 'Extracts entities, indicators, and content from uploaded evidence files.', status: 'completed', lastRun: '2026-08-28T10:45:00Z', entitiesExtracted: 7, indicatorsFound: 3, confidence: 94, findings: 2, executionTimeMs: 4200, icon: 'inventory_2' },
  { id: 'AG-002', name: 'Threat Agent', description: 'Analyzes domains, IPs, and URLs against threat intelligence databases.', status: 'completed', lastRun: '2026-08-28T10:47:00Z', entitiesExtracted: 3, indicatorsFound: 8, confidence: 91, findings: 2, executionTimeMs: 3800, icon: 'security' },
  { id: 'AG-003', name: 'Financial Agent', description: 'Detects financial anomalies, suspicious patterns, and money laundering indicators.', status: 'completed', lastRun: '2026-08-28T10:50:00Z', entitiesExtracted: 5, indicatorsFound: 4, confidence: 88, findings: 2, executionTimeMs: 5100, icon: 'payments' },
  { id: 'AG-004', name: 'Graph Agent', description: 'Builds entity relationship graphs and identifies suspicious clusters and connections.', status: 'completed', lastRun: '2026-08-28T10:55:00Z', entitiesExtracted: 19, indicatorsFound: 6, confidence: 89, findings: 2, executionTimeMs: 7200, icon: 'hub' },
  { id: 'AG-005', name: 'Investigation Agent', description: 'Synthesizes findings from all agents and generates case-level intelligence summary.', status: 'running', lastRun: '2026-08-28T11:00:00Z', entitiesExtracted: 0, indicatorsFound: 0, confidence: 0, findings: 0, executionTimeMs: 0, icon: 'psychology' },
];

// ─── Audit Logs ──────────────────────────────────────────────

export const mockAuditLogs: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2026-08-28T10:41:22Z', userId: 'USR-001', userName: 'Rahul Sharma', action: 'VIEW_EVIDENCE', resource: 'Evidence', resourceId: 'EV-001', ipAddress: '192.168.1.100', sessionId: 'SES-A1B2C3' },
  { id: 'AUD-002', timestamp: '2026-08-28T10:43:18Z', userId: 'USR-002', userName: 'Priya Patel', action: 'ACCEPT_FINDING', resource: 'Finding', resourceId: 'FND-102', details: 'Confirmed mule pattern. Account flagged.', ipAddress: '192.168.1.101', sessionId: 'SES-D4E5F6' },
  { id: 'AUD-003', timestamp: '2026-08-28T10:51:02Z', userId: 'USR-003', userName: 'Ankit Verma', action: 'GENERATE_REPORT', resource: 'Case', resourceId: 'CASE-1021', ipAddress: '192.168.1.102', sessionId: 'SES-G7H8I9' },
  { id: 'AUD-004', timestamp: '2026-08-28T09:30:00Z', userId: 'USR-005', userName: 'Suresh Kumar', action: 'UPDATE_USER_ROLE', resource: 'User', resourceId: 'USR-008', details: 'Changed role from ANALYST to inactive.', ipAddress: '192.168.1.200', sessionId: 'SES-J0K1L2' },
  { id: 'AUD-005', timestamp: '2026-08-28T08:15:00Z', userId: 'USR-001', userName: 'Rahul Sharma', action: 'CREATE_CASE', resource: 'Case', resourceId: 'CASE-1032', ipAddress: '192.168.1.100', sessionId: 'SES-M3N4O5' },
  { id: 'AUD-006', timestamp: '2026-08-28T11:00:00Z', userId: 'USR-006', userName: 'Sarah Jenkins', action: 'VIEW_CASE', resource: 'Case', resourceId: 'CASE-1024', ipAddress: '192.168.1.103', sessionId: 'SES-P6Q7R8' },
  { id: 'AUD-007', timestamp: '2026-08-27T16:30:00Z', userId: 'USR-001', userName: 'Rahul Sharma', action: 'ASSIGN_CASE', resource: 'Case', resourceId: 'CASE-1021', details: 'Assigned to self.', ipAddress: '192.168.1.100', sessionId: 'SES-S9T0U1' },
  { id: 'AUD-008', timestamp: '2026-08-27T14:20:00Z', userId: 'USR-002', userName: 'Priya Patel', action: 'UPLOAD_EVIDENCE', resource: 'Evidence', resourceId: 'EV-002', ipAddress: '192.168.1.101', sessionId: 'SES-V2W3X4' },
  { id: 'AUD-009', timestamp: '2026-08-27T10:00:00Z', userId: 'SYSTEM', userName: 'System', action: 'AI_ANALYSIS_COMPLETE', resource: 'Case', resourceId: 'CASE-1021', details: 'All AI agents completed analysis.', ipAddress: '0.0.0.0', sessionId: 'SES-SYSTEM' },
  { id: 'AUD-010', timestamp: '2026-08-28T12:00:00Z', userId: 'USR-003', userName: 'Ankit Verma', action: 'ACCEPT_FINDING', resource: 'Finding', resourceId: 'FND-103', ipAddress: '192.168.1.102', sessionId: 'SES-Y5Z6A7' },
  { id: 'AUD-011', timestamp: '2026-08-28T14:00:00Z', userId: 'USR-004', userName: 'Meera Singh', action: 'VIEW_AUDIT_LOG', resource: 'AuditLog', resourceId: 'ALL', ipAddress: '192.168.1.104', sessionId: 'SES-B8C9D0' },
  { id: 'AUD-012', timestamp: '2026-08-28T13:15:00Z', userId: 'USR-007', userName: 'David Chen', action: 'ESCALATE_CASE', resource: 'Case', resourceId: 'CASE-1022', details: 'Escalated to CRITICAL. Potential data breach.', ipAddress: '192.168.1.105', sessionId: 'SES-E1F2G3' },
];

// ─── Reports (Normal User) ──────────────────────────────────

export const mockReports: Report[] = [
  {
    id: 'SEN-8F29A', caseId: 'CASE-1021', reportDate: '2026-08-28T10:42:00Z', riskLevel: RiskLevel.HIGH, riskScore: 92, status: ReportStatus.INVESTIGATING, evidenceType: EvidenceType.IMAGE,
    summary: 'This content shows several indicators associated with fraudulent activity including suspicious payment requests, potential impersonation, and links to known fraud patterns.',
    detectedEntities: [
      { type: 'URL', value: 'suspicious-example.com', confidence: 95 },
      { type: 'Phone', value: '+91 98XXX XXXXX', confidence: 88 },
      { type: 'UPI', value: 'fraudster@example', confidence: 94 },
      { type: 'Amount', value: '₹48,500', confidence: 99 },
      { type: 'Organization', value: 'Example Bank', confidence: 72 },
      { type: 'Date', value: '28 Aug 2026', confidence: 99 },
    ],
    riskIndicators: [
      { title: 'Suspicious Domain', severity: Severity.HIGH, score: 25, description: 'The domain appears unrelated to the claimed organization. Registered 14 days ago with privacy protection.', confidence: 95 },
      { title: 'Possible Impersonation', severity: Severity.HIGH, score: 20, description: 'Content mimics official banking communication but uses non-official channels and domains.', confidence: 88 },
      { title: 'Urgent Language', severity: Severity.MEDIUM, score: 18, description: 'Message contains urgency triggers designed to bypass rational decision-making.', confidence: 82 },
      { title: 'Payment Request', severity: Severity.HIGH, score: 15, description: 'Unsolicited payment request to an unverified UPI ID.', confidence: 90 },
      { title: 'Transaction Anomaly', severity: Severity.MEDIUM, score: 10, description: 'Requested amount and transaction pattern differs from normal activity.', confidence: 75 },
      { title: 'Related Suspicious Entity', severity: Severity.LOW, score: 4, description: 'UPI ID linked to 7 previously reported cases.', confidence: 70 },
    ],
    recommendations: [
      'Do not send money to this UPI ID.',
      'Do not share passwords, OTPs, or banking credentials.',
      'Avoid clicking on any links in the message.',
      'Contact your bank immediately if you have already sent money.',
      'Preserve the original evidence (screenshot, message).',
      'Report this to the National Cyber Crime Portal (cybercrime.gov.in).',
    ],
  },
  {
    id: 'SEN-72AC1', reportDate: '2026-08-25T14:00:00Z', riskLevel: RiskLevel.LOW, riskScore: 22, status: ReportStatus.RESOLVED, evidenceType: EvidenceType.URL,
    summary: 'The submitted URL appears to be a legitimate website with no significant risk indicators detected.',
    detectedEntities: [{ type: 'URL', value: 'example-shop.com', confidence: 99 }],
    riskIndicators: [{ title: 'New Domain', severity: Severity.LOW, score: 12, description: 'Domain registered recently but no other risk indicators found.', confidence: 60 }],
    recommendations: ['Exercise normal caution when sharing personal information online.'],
  },
  {
    id: 'SEN-41BA9', reportDate: '2026-08-20T09:00:00Z', riskLevel: RiskLevel.MEDIUM, riskScore: 58, status: ReportStatus.CLOSED, evidenceType: EvidenceType.MESSAGE,
    summary: 'The message contains some indicators of a potential social engineering attempt but lacks definitive fraud markers.',
    detectedEntities: [{ type: 'Phone', value: '+91 87XXX XXXXX', confidence: 92 }, { type: 'Organization', value: 'SBI', confidence: 80 }],
    riskIndicators: [
      { title: 'Social Engineering Indicators', severity: Severity.MEDIUM, score: 30, description: 'Message uses trust-building language and authority claims.', confidence: 75 },
      { title: 'Unverified Source', severity: Severity.MEDIUM, score: 18, description: 'Message originates from unverified phone number.', confidence: 70 },
    ],
    recommendations: ['Do not respond to the message.', 'Verify directly with SBI through official channels.'],
  },
  { id: 'SEN-9D3B2', reportDate: '2026-08-27T16:00:00Z', riskLevel: RiskLevel.HIGH, riskScore: 85, status: ReportStatus.INVESTIGATING, evidenceType: EvidenceType.QR_CODE, summary: 'QR code redirects to a payment address different from the displayed merchant information.', detectedEntities: [{ type: 'UPI', value: 'redirect@upi', confidence: 96 }], riskIndicators: [{ title: 'QR Code Tampering', severity: Severity.HIGH, score: 45, description: 'QR decodes to UPI ID not matching merchant registration.', confidence: 89 }], recommendations: ['Do not scan this QR code for payments.', 'Alert the merchant about potential tampering.'] },
  { id: 'SEN-5E7F4', reportDate: '2026-08-22T11:00:00Z', riskLevel: RiskLevel.CRITICAL, riskScore: 95, status: ReportStatus.INVESTIGATING, evidenceType: EvidenceType.PDF, summary: 'Document contains malicious macro code designed to harvest system credentials.', detectedEntities: [{ type: 'Domain', value: 'c2-server.malicious.com', confidence: 97 }], riskIndicators: [{ title: 'Malicious Macro', severity: Severity.CRITICAL, score: 50, description: 'PDF contains obfuscated PowerShell code connecting to known C2 server.', confidence: 97 }], recommendations: ['Do not open this file on any system.', 'If already opened, disconnect from network and run antivirus scan.'] },
];

// ─── Notifications ───────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: 'NTF-001', type: 'danger', title: 'High-risk case assigned', message: 'CASE-1021 (P2P UPI Mule Network) has been assigned to you.', timestamp: '2026-08-28T14:30:00Z', read: false, actionUrl: '/investigator/cases/CASE-1021' },
  { id: 'NTF-002', type: 'warning', title: 'New evidence uploaded', message: 'New screenshot uploaded to CASE-1021.', timestamp: '2026-08-28T10:42:00Z', read: false, actionUrl: '/investigator/cases/CASE-1021' },
  { id: 'NTF-003', type: 'info', title: 'AI analysis completed', message: 'All AI agents have completed analysis for CASE-1021.', timestamp: '2026-08-28T11:00:00Z', read: true, actionUrl: '/investigator/cases/CASE-1021' },
  { id: 'NTF-004', type: 'success', title: 'Report generated', message: 'Report for CASE-1031 has been generated successfully.', timestamp: '2026-08-20T10:00:00Z', read: true },
  { id: 'NTF-005', type: 'warning', title: 'Review required', message: 'Finding FND-109 requires human review.', timestamp: '2026-08-28T11:10:00Z', read: false, actionUrl: '/investigator/findings' },
];

// ─── Graph Data ──────────────────────────────────────────────

export const mockGraphNodes: GraphNode[] = [
  { id: 'gn-1', type: EntityType.PERSON, label: 'Victim Account (VIC-88921)', riskScore: 10, metadata: { loss: '₹45,000' } },
  { id: 'gn-2', type: EntityType.UPI, label: 'fraudster@example', riskScore: 94, metadata: { txns: '142 (Last 24h)' } },
  { id: 'gn-3', type: EntityType.BANK_ACCOUNT, label: 'Mule Acc #441', riskScore: 92, metadata: { status: 'Frozen', balance: '₹1,200' } },
  { id: 'gn-4', type: EntityType.BANK_ACCOUNT, label: 'ICICI Bank Ltd', riskScore: 15, metadata: { branch: 'Mumbai Main', ifsc: 'ICIC0000001' } },
  { id: 'gn-5', type: EntityType.WALLET, label: 'Bitcoin Wallet (bc1q...x9f2)', riskScore: 85, metadata: { totalReceived: '2.4 BTC' } },
  { id: 'gn-6', type: EntityType.IP_ADDRESS, label: '103.44.xx.xx (Proxy)', riskScore: 88, metadata: { type: 'PROXY' } },
  { id: 'gn-7', type: EntityType.PERSON, label: 'VIC-88922', riskScore: 10, metadata: { loss: '₹25,000' } },
];

export const mockGraphEdges: GraphEdge[] = [
  { id: 'ge-1', source: 'gn-1', target: 'gn-2', relationship: 'PAID_TO', label: '₹45,000' },
  { id: 'ge-2', source: 'gn-2', target: 'gn-3', relationship: 'TRANSFERRED_TO', label: '₹44,800' },
  { id: 'ge-3', source: 'gn-3', target: 'gn-4', relationship: 'TRANSFERRED_TO', label: '₹44,000' },
  { id: 'ge-4', source: 'gn-4', target: 'gn-5', relationship: 'TRANSFERRED_TO', label: '₹43,500' },
  { id: 'ge-5', source: 'gn-6', target: 'gn-2', relationship: 'ASSOCIATED_WITH' },
  { id: 'ge-6', source: 'gn-7', target: 'gn-2', relationship: 'PAID_TO', label: '₹25,000' },
];
