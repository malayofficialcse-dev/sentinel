import { Evidence, EvidenceType } from '../types';
import { mockEvidence } from '../data/mockData';
import { delay } from './api';

let evidenceList = [...mockEvidence];

export const evidenceApi = {
  async getEvidenceByCase(caseId?: string): Promise<Evidence[]> {
    await delay(200);
    if (!caseId) return evidenceList;
    return evidenceList.filter((e) => e.caseId.toLowerCase() === caseId.toLowerCase());
  },

  async getEvidenceById(id: string): Promise<Evidence | null> {
    await delay(150);
    return evidenceList.find((e) => e.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async uploadEvidence(newEvidence: Partial<Evidence>): Promise<Evidence> {
    await delay(500);
    const created: Evidence = {
      id: `EV-${String(evidenceList.length + 1).padStart(3, '0')}`,
      caseId: newEvidence.caseId || 'CASE-1021',
      type: newEvidence.type || EvidenceType.IMAGE,
      fileName: newEvidence.fileName || 'uploaded_evidence.png',
      fileSize: newEvidence.fileSize || 1024000,
      mimeType: newEvidence.mimeType || 'image/png',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      hashAlgorithm: 'SHA-256',
      uploadedBy: newEvidence.uploadedBy || 'Reporter',
      uploadedAt: new Date().toISOString(),
      status: newEvidence.status || (('VERIFIED' as any)),
      integrityVerified: true,
      extractedEntities: 3,
      extractedIndicators: 2,
      ...newEvidence,
    };
    evidenceList.unshift(created);
    return created;
  },
};
