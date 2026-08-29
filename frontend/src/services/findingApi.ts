import { Finding, FindingStatus } from '../types';
import { mockFindings } from '../data/mockData';
import { delay } from './api';

let findings = [...mockFindings];

export const findingApi = {
  async getFindings(filters?: { caseId?: string; status?: FindingStatus }): Promise<Finding[]> {
    await delay(200);
    let list = [...findings];
    if (filters?.caseId) {
      list = list.filter((f) => f.caseId.toLowerCase() === filters.caseId!.toLowerCase());
    }
    if (filters?.status) {
      list = list.filter((f) => f.status === filters.status);
    }
    return list;
  },

  async updateFindingStatus(id: string, status: FindingStatus, reviewerName: string, notes?: string): Promise<Finding> {
    await delay(200);
    const index = findings.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Finding not found');
    findings[index] = {
      ...findings[index],
      status,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes || findings[index].reviewNotes,
    };
    return findings[index];
  },
};
