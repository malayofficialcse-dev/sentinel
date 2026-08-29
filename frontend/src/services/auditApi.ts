import { AuditLog } from '../types';
import { mockAuditLogs } from '../data/mockData';
import { delay } from './api';

let auditLogs = [...mockAuditLogs];

export const auditApi = {
  async getAuditLogs(filters?: { action?: string; search?: string }): Promise<AuditLog[]> {
    await delay(200);
    let list = [...auditLogs];
    if (filters?.action) {
      list = list.filter((a) => a.action.toLowerCase() === filters.action!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.userName.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.resource.toLowerCase().includes(q) ||
          a.resourceId.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async recordLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const entry: AuditLog = {
      id: `AUD-${String(auditLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    auditLogs.unshift(entry);
    return entry;
  },
};
