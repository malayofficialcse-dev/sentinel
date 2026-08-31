import { apiClient } from './api';
import { Finding, FindingStatus, Severity } from '../types';

function mapFinding(item: any): Finding {
  return {
    id: item.id,
    caseId: item.caseId || '',
    title: item.title || '',
    description: item.description || '',
    severity: (item.severity || 'MEDIUM') as Severity,
    confidence: Number(item.confidence ?? 0),
    status: (item.status as FindingStatus) || FindingStatus.PENDING,
    evidenceIds: item.evidenceRefs || [],
    reason: item.description || '',
    agentName: item.category || 'AnalysisAgent',
    createdAt: item.createdAt || new Date().toISOString(),
    reviewedBy: item.reviewedBy,
    reviewedAt: item.reviewedAt,
    reviewNotes: item.reviewNotes,
  };
}

export const findingApi = {
  async getFindings(filters?: { caseId?: string; status?: FindingStatus }): Promise<Finding[]> {
    const params: Record<string, string> = {};
    if (filters?.caseId) params.caseId = filters.caseId;
    if (filters?.status) params.status = filters.status;
    const res = await apiClient.get('/findings', { params });
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return list.map(mapFinding);
  },

  async updateFindingStatus(id: string, status: FindingStatus): Promise<Finding> {
    const res = await apiClient.patch(`/findings/${id}`, { status });
    return mapFinding(res.data);
  },
};
