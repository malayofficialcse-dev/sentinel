import { apiClient } from './api';
import { ThreatIntel } from '../types';

export const threatApi = {
  async getThreatIntel(filters?: { reputation?: string; search?: string }): Promise<ThreatIntel[]> {
    const res = await apiClient.get('/threat-intelligence');
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    let items: ThreatIntel[] = list;
    if (filters?.reputation) {
      items = items.filter((t) => t.reputation === filters.reputation);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (t) =>
          t.indicator.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return items;
  },

  async getThreatById(id: string): Promise<ThreatIntel | null> {
    const list = await threatApi.getThreatIntel();
    return list.find((t) => t.id === id || t.indicator.toLowerCase() === id.toLowerCase()) || null;
  },
};
