import { Transaction, TransactionStatus } from '../types';
import { mockTransactions } from '../data/mockData';
import { delay } from './api';

export const financialApi = {
  async getTransactions(filters?: { caseId?: string; flagged?: boolean; search?: string }): Promise<Transaction[]> {
    await delay(200);
    let list = [...mockTransactions];
    if (filters?.caseId) {
      list = list.filter((t) => t.caseId.toLowerCase() === filters.caseId!.toLowerCase());
    }
    if (filters?.flagged !== undefined) {
      list = list.filter((t) => t.flagged === filters.flagged);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.sender.toLowerCase().includes(q) ||
          t.receiver.toLowerCase().includes(q) ||
          t.method.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async updateTransactionStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    await delay(200);
    const txn = mockTransactions.find((t) => t.id === id);
    if (!txn) throw new Error('Transaction not found');
    txn.status = status;
    return txn;
  },
};
