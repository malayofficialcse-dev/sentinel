// ─── Enums / Const Objects (erasableSyntaxOnly compatible) ────

export const UserRole = {
  REPORTER: 'REPORTER',
  INVESTIGATOR: 'INVESTIGATOR',
  ANALYST: 'ANALYST',
  REVIEWER: 'REVIEWER',
  AUDITOR: 'AUDITOR',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  SUBMIT_REPORT: 'SUBMIT_REPORT',
  VIEW_OWN_REPORTS: 'VIEW_OWN_REPORTS',
  VIEW_ALL_CASES: 'VIEW_ALL_CASES',
  MANAGE_CASES: 'MANAGE_CASES',
  VIEW_EVIDENCE: 'VIEW_EVIDENCE',
  MANAGE_EVIDENCE: 'MANAGE_EVIDENCE',
  VIEW_ENTITIES: 'VIEW_ENTITIES',
  VIEW_GRAPH: 'VIEW_GRAPH',
  VIEW_THREAT_INTEL: 'VIEW_THREAT_INTEL',
  VIEW_FINANCIAL: 'VIEW_FINANCIAL',
  VIEW_FINDINGS: 'VIEW_FINDINGS',
  REVIEW_FINDINGS: 'REVIEW_FINDINGS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  GENERATE_REPORTS: 'GENERATE_REPORTS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  MANAGE_SYSTEM: 'MANAGE_SYSTEM',
  VIEW_AI_AGENTS: 'VIEW_AI_AGENTS',
  VIEW_TIMELINE: 'VIEW_TIMELINE',
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

export const CaseStatus = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

export const EvidenceType = {
  IMAGE: 'IMAGE',
  PDF: 'PDF',
  URL: 'URL',
  QR_CODE: 'QR_CODE',
  MESSAGE: 'MESSAGE',
  TRANSACTION: 'TRANSACTION',
  LOG: 'LOG',
  DOCUMENT: 'DOCUMENT',
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export const EvidenceStatus = {
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  ANALYZED: 'ANALYZED',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
} as const;
export type EvidenceStatus = (typeof EvidenceStatus)[keyof typeof EvidenceStatus];

export const EntityType = {
  PERSON: 'PERSON',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  URL: 'URL',
  DOMAIN: 'DOMAIN',
  UPI: 'UPI',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  WALLET: 'WALLET',
  TRANSACTION: 'TRANSACTION',
  ORGANIZATION: 'ORGANIZATION',
  DEVICE: 'DEVICE',
  IP_ADDRESS: 'IP_ADDRESS',
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const RiskLevel = {
  SAFE: 'SAFE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const FindingStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  MODIFIED: 'MODIFIED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
} as const;
export type FindingStatus = (typeof FindingStatus)[keyof typeof FindingStatus];

export const ReportStatus = {
  SUBMITTED: 'SUBMITTED',
  PROCESSING: 'PROCESSING',
  ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const TransactionStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED',
  FLAGGED: 'FLAGGED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

// ─── Interfaces ──────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  permissions: Permission[];
  createdAt: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: CaseStatus;
  assignedTo?: User;
  assignedToId?: string;
  riskScore: number;
  evidenceCount: number;
  entityCount: number;
  findingCount: number;
  transactionCount: number;
  relatedCaseCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  aiSummary?: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  type: EvidenceType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  hash: string;
  hashAlgorithm: string;
  uploadedBy: string;
  uploadedAt: string;
  status: EvidenceStatus;
  thumbnailUrl?: string;
  fileUrl?: string;
  integrityVerified: boolean;
  extractedEntities: number;
  extractedIndicators: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  value: string;
  displayName: string;
  confidence: number;
  riskScore: number;
  caseCount: number;
  firstSeen: string;
  lastSeen: string;
  metadata: Record<string, string>;
  relatedEntityIds: string[];
}

export interface Finding {
  id: string;
  caseId: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  status: FindingStatus;
  evidenceIds: string[];
  agentName: string;
  reason: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  caseId: string;
  timestamp: string;
  sender: string;
  senderType: EntityType;
  receiver: string;
  receiverType: EntityType;
  amount: number;
  currency: string;
  method: string;
  status: TransactionStatus;
  riskScore: number;
  flagged: boolean;
  notes?: string;
}

export interface ThreatIntel {
  id: string;
  indicator: string;
  indicatorType: 'DOMAIN' | 'IP' | 'URL' | 'EMAIL' | 'HASH';
  reputation: RiskLevel;
  threatMatches: number;
  relatedCases: number;
  source: string;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  description: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastRun?: string;
  entitiesExtracted: number;
  indicatorsFound: number;
  confidence: number;
  findings: number;
  executionTimeMs: number;
  icon: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: string;
  ipAddress: string;
  sessionId: string;
}

export interface Report {
  id: string;
  reporterId?: string;
  caseId?: string;
  reportDate: string;
  riskLevel: RiskLevel;
  riskScore: number;
  status: ReportStatus;
  evidenceType: EvidenceType;
  summary?: string;
  detectedEntities: DetectedEntity[];
  riskIndicators: RiskIndicator[];
  recommendations: string[];
}

export interface DetectedEntity {
  type: string;
  value: string;
  confidence: number;
}

export interface RiskIndicator {
  title: string;
  severity: Severity;
  score: number;
  description: string;
  confidence: number;
  evidenceId?: string;
}

export interface Notification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  riskScore: number;
  metadata: Record<string, string>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  label?: string;
  weight?: number;
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
}

// ─── API Response Types ──────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: string;
}
