import { apiClient } from './api';

export interface DashboardStats {
  totalCases: number;
  openCases: number;
  highRiskCases: number;
  underReview: number;
  totalEvidence: number;
  totalFindings: number;
  totalEntities: number;
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get('/dashboard');
    return res.data as DashboardStats;
  },
};
