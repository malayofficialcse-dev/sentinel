import { Case, CaseStatus, Severity } from '../types';
import { mockCases } from '../data/mockData';
import { delay } from './api';

let cases = [...mockCases];

export const caseApi = {
  async getCases(filters?: { status?: CaseStatus; severity?: Severity; search?: string }): Promise<Case[]> {
    await delay(200);
    let result = [...cases];
    if (filters?.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters?.severity) {
      result = result.filter((c) => c.severity === filters.severity);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getCaseById(id: string): Promise<Case | null> {
    await delay(150);
    return cases.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async updateCaseStatus(id: string, status: CaseStatus): Promise<Case> {
    await delay(200);
    const index = cases.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Case not found');
    cases[index] = { ...cases[index], status, updatedAt: new Date().toISOString() };
    return cases[index];
  },

  async assignCase(id: string, userId: string, userName: string): Promise<Case> {
    await delay(200);
    const index = cases.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Case not found');
    cases[index] = {
      ...cases[index],
      assignedToId: userId,
      assignedTo: {
        id: userId,
        name: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, '.')}@sentinel.gov`,
        role: cases[index].assignedTo?.role || ('' as any),
        status: 'active',
        permissions: [],
        createdAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    return cases[index];
  },
};
