import { ThreatIntel, RiskLevel } from '../types';
import { mockThreatIntel } from '../data/mockData';
import { delay } from './api';

export const threatApi = {
  async getThreatIntel(filters?: { reputation?: RiskLevel; search?: string }): Promise<ThreatIntel[]> {
    await delay(200);
    let list = [...mockThreatIntel];
    if (filters?.reputation) {
      list = list.filter((t) => t.reputation === filters.reputation);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.indicator.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getThreatById(id: string): Promise<ThreatIntel | null> {
    await delay(150);
    return mockThreatIntel.find((t) => t.id === id || t.indicator.toLowerCase() === id.toLowerCase()) || null;
  },
};
