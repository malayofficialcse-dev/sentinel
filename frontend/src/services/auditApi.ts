import { apiClient } from './api';
import { AuditLog } from '../types';

export const auditApi = {
  async getAuditLogs(filters?: { action?: string; search?: string }): Promise<AuditLog[]> {
    const res = await apiClient.get('/audit-logs');
    let list: AuditLog[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
    if (filters?.action) {
      list = list.filter((a) => a.action.toLowerCase() === filters.action!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.userName || '').toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          (a.resource || '').toLowerCase().includes(q) ||
          (a.resourceId || '').toLowerCase().includes(q)
      );
    }
    return list;
  },

  async recordLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    // Audit logging is recorded server-side; this is a client-side no-op stub
    return { id: '', timestamp: new Date().toISOString(), ...log };
  },
};
