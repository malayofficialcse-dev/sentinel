import { apiClient } from './api';
import { Report, RiskLevel, ReportStatus, EvidenceType, RiskIndicator, Severity } from '../types';

function normalizeRiskIndicators(raw: any): RiskIndicator[] {
  const source = Array.isArray(raw)
    ? raw
    : Object.entries(raw || {}).map(([label, value]) => ({ label, value }));

  return source.map((item: any, index): RiskIndicator => {
    const score = Number(item?.score ?? item?.weight ?? (typeof item?.value === 'number' ? item.value : 0)) || 0;
    const severity = String(item?.severity || (score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW')) as Severity;
    const rawDescription = item?.description ?? item?.value;

    return {
      title: String(item?.title ?? item?.label ?? item?.name ?? `Risk factor ${index + 1}`),
      severity,
      score,
      description: typeof rawDescription === 'string'
        ? rawDescription
        : rawDescription == null
          ? 'This factor was identified during evidence analysis.'
          : JSON.stringify(rawDescription),
      confidence: Number(item?.confidence ?? 1),
      evidenceId: item?.evidenceId,
    };
  });
}

function mapReport(item: any): Report {
  return {
    id: item.id,
    caseId: item.caseId,
    reporterId: item.reporterId,
    reportDate: item.reportDate || item.createdAt || new Date().toISOString(),
    status: (item.status as ReportStatus) || ReportStatus.PROCESSING,
    riskScore: Number(item.riskScore ?? 0),
    riskLevel: (item.riskLevel as RiskLevel) || RiskLevel.LOW,
    evidenceType: (item.evidenceType as EvidenceType) || EvidenceType.DOCUMENT,
    summary: item.summary || '',
    detectedEntities: item.detectedEntities || [],
    riskIndicators: normalizeRiskIndicators(item.riskIndicators || item.risk?.factors),
    recommendations: item.recommendations || [],
  };
}

export const reportApi = {
  async getReports(filters?: { riskLevel?: string; status?: string; search?: string }): Promise<Report[]> {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    const res = await apiClient.get('/reports', { params });
    let list = (Array.isArray(res.data) ? res.data : res.data?.data || []).map(mapReport);
    if (filters?.riskLevel) {
      list = list.filter((r: Report) => r.riskLevel === filters.riskLevel);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((r: Report) =>
        r.id.toLowerCase().includes(q) ||
        (r.summary || '').toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getReportById(id: string): Promise<Report | null> {
    const res = await apiClient.get(`/reports/${id}`);
    return res.data ? mapReport(res.data) : null;
  },

  async createReport(data: Partial<Report>): Promise<Report> {
    const res = await apiClient.post('/reports', data);
    return mapReport(res.data);
  },
};
