import { apiClient } from './api';
import { Entity } from '../types';

export const entityApi = {
  async getEntities(filters?: { type?: string; search?: string; caseId?: string }): Promise<Entity[]> {
    const params: Record<string, string> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.search) params.search = filters.search;
    if (filters?.caseId) params.caseId = filters.caseId;
    const res = await apiClient.get('/entities', { params });
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return list.map((item: any): Entity => ({
      id: item.id,
      type: item.type as any,
      value: item.canonicalValue || item.value || '',
      displayName: item.displayName || item.canonicalValue || '',
      riskScore: Number(item.riskScore ?? 0),
      confidence: Number(item.confidence ?? 0),
      caseCount: 1,
      firstSeen: item.firstSeen || item.createdAt || new Date().toISOString(),
      lastSeen: item.lastSeen || item.updatedAt || new Date().toISOString(),
      metadata: {},
      relatedEntityIds: [],
    }));
  },

  async getEntityById(id: string): Promise<Entity | null> {
    const res = await apiClient.get(`/entities`, { params: { id } });
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    const item = list.find((e: any) => e.id === id);
    if (!item) return null;
    return {
      id: item.id,
      type: item.type as any,
      value: item.canonicalValue || item.value || '',
      displayName: item.displayName || item.canonicalValue || '',
      riskScore: Number(item.riskScore ?? 0),
      confidence: Number(item.confidence ?? 0),
      caseCount: 1,
      firstSeen: item.firstSeen || item.createdAt || new Date().toISOString(),
      lastSeen: item.lastSeen || item.updatedAt || new Date().toISOString(),
      metadata: {},
      relatedEntityIds: [],
    };
  },
};
