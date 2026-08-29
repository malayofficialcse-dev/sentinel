import { Report, ReportStatus, RiskLevel } from '../types';
import { mockReports } from '../data/mockData';
import { delay } from './api';

let reports = [...mockReports];

export const reportApi = {
  async getReports(filters?: { riskLevel?: RiskLevel; status?: ReportStatus; search?: string }): Promise<Report[]> {
    await delay(200);
    let list = [...reports];
    if (filters?.riskLevel) {
      list = list.filter((r) => r.riskLevel === filters.riskLevel);
    }
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.summary?.toLowerCase().includes(q) ||
          r.detectedEntities.some((e) => e.value.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getReportById(id: string): Promise<Report | null> {
    await delay(150);
    return reports.find((r) => r.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async createReport(data: Partial<Report>): Promise<Report> {
    await delay(600);
    const newReport: Report = {
      id: `SEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      reportDate: new Date().toISOString(),
      riskLevel: data.riskLevel || RiskLevel.HIGH,
      riskScore: data.riskScore || 92,
      status: ReportStatus.INVESTIGATING,
      evidenceType: data.evidenceType || (('IMAGE' as any)),
      summary: data.summary || 'AI Analysis completed. Multiple suspicious indicators identified.',
      detectedEntities: data.detectedEntities || [],
      riskIndicators: data.riskIndicators || [],
      recommendations: data.recommendations || [
        'Do not send money to any unverified account.',
        'Preserve the original evidence.',
        'Report to cybercrime authorities.',
      ],
      ...data,
    };
    reports.unshift(newReport);
    return newReport;
  },
};
