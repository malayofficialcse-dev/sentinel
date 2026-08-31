import { apiClient } from './api';
import { Transaction, EntityType, TransactionStatus } from '../types';

function mapTransaction(item: any): Transaction {
  return {
    id: item.id,
    caseId: item.caseId || '',
    sender: item.sender || '',
    senderType: (item.senderType as EntityType) || EntityType.PERSON,
    receiver: item.receiver || '',
    receiverType: (item.receiverType as EntityType) || EntityType.BANK_ACCOUNT,
    amount: Number(item.amount ?? 0),
    currency: item.currency || 'INR',
    method: item.metadata?.type || item.method || 'UPI',
    timestamp: item.occurredAt || item.createdAt || new Date().toISOString(),
    riskScore: Number(item.riskScore ?? 0),
    flagged: Boolean(item.flagged ?? false),
    status: (item.status as TransactionStatus) || TransactionStatus.COMPLETED,
    notes: item.notes,
  };
}

export const financialApi = {
  async getTransactions(filters?: { caseId?: string; search?: string }): Promise<Transaction[]> {
    const params: Record<string, string> = {};
    if (filters?.caseId) params.caseId = filters.caseId;
    const res = await apiClient.get('/transactions', { params });
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    let mapped = list.map(mapTransaction);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      mapped = mapped.filter(
        (t: Transaction) =>
          t.sender.toLowerCase().includes(q) ||
          t.receiver.toLowerCase().includes(q) ||
          t.method.toLowerCase().includes(q)
      );
    }
    return mapped;
  },

  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const res = await apiClient.patch(`/transactions/${id}`, { status });
    return mapTransaction(res.data);
  },
};
