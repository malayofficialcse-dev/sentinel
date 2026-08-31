import { apiClient } from './api';
import { Evidence, EvidenceType } from '../types';

function mapEvidence(item: any): Evidence {
  return { id: item.id, caseId: item.caseId, type: item.type as EvidenceType, fileName: item.fileName, fileSize: Number(item.sizeBytes || 0), mimeType: item.mimeType, hash: item.sha256, hashAlgorithm: 'SHA-256', uploadedBy: item.uploadedBy || 'System', uploadedAt: item.createdAt, status: item.status, integrityVerified: true, extractedEntities: 0, extractedIndicators: 0 };
}

export const evidenceApi = {
  async getEvidenceByCase(caseId: string): Promise<Evidence[]> {
    const res = await apiClient.get(`/cases/${caseId}/evidence`);
    return (Array.isArray(res.data) ? res.data : res.data?.data || []).map(mapEvidence);
  },
  async getEvidenceById(id: string): Promise<Evidence | null> { throw new Error(`Evidence lookup by id is not available without a case id: ${id}`); },
  async uploadFile(caseId: string, file: File): Promise<{ evidence: Evidence; analysis: Record<string, any> }> {
    const form = new FormData(); form.append('file', file);
    const res = await apiClient.post(`/cases/${caseId}/evidence`, form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 });
    return { evidence: mapEvidence(res.data.evidence), analysis: res.data.analysis };
  },
  async uploadEvidence(_newEvidence: Partial<Evidence>): Promise<Evidence> { throw new Error('Use uploadFile(caseId, file) to submit real evidence.'); },
};
