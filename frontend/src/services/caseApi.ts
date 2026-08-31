import { apiClient } from './api';
import { Case, CaseStatus, Severity } from '../types';

type BackendCase = Record<string, any>;

function mapCase(item: BackendCase): Case {
  const score = item.riskScores?.[0]?.score ?? 0;
  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    severity: item.severity as Severity,
    status: item.status as CaseStatus,
    riskScore: Number(score),
    evidenceCount: item._count?.evidence ?? item.evidence?.length ?? 0,
    entityCount: item._count?.entities ?? item.entities?.length ?? 0,
    findingCount: item._count?.findings ?? item.findings?.length ?? 0,
    transactionCount: item._count?.transactions ?? item.transactions?.length ?? 0,
    relatedCaseCount: 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    tags: [],
  };
}

export const caseApi = {
  async getCases(filters?: { status?: CaseStatus; severity?: Severity; search?: string }): Promise<Case[]> {
    const res = await apiClient.get('/cases');
    let cases: Case[] = (Array.isArray(res.data) ? res.data : res.data?.data || []).map(mapCase);
    if (filters?.status) cases = cases.filter((item) => item.status === filters.status);
    if (filters?.severity) cases = cases.filter((item) => item.severity === filters.severity);
    if (filters?.search) { const query = filters.search.toLowerCase(); cases = cases.filter((item) => `${item.id} ${item.title} ${item.description}`.toLowerCase().includes(query)); }
    return cases;
  },
  async getCaseById(id: string): Promise<Case | null> {
    const res = await apiClient.get(`/cases/${id}`);
    return res.data ? mapCase(res.data) : null;
  },
  async getCaseData(id: string): Promise<Record<string, any> | null> {
    const res = await apiClient.get(`/cases/${id}`);
    return res.data || null;
  },
  async createCase(title: string, description?: string): Promise<Case> {
    const res = await apiClient.post('/cases', { title, description });
    return mapCase(res.data);
  },
  async investigate(caseId: string, payload: Record<string, unknown>) {
    const res = await apiClient.post(`/cases/${caseId}/investigate`, payload, { timeout: 120000 });
    return res.data;
  },
  async updateCaseStatus(id: string, status: CaseStatus): Promise<Case> {
    throw new Error('Case status update API is not implemented yet.');
  },
  async assignCase(_id: string, _userId: string, _userName: string): Promise<Case> {
    throw new Error('Case assignment API is not implemented yet.');
  },
};
