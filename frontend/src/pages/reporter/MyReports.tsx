import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../services/reportApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { RiskBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Report, RiskLevel } from '../../types';

export const MyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    reportApi.getReports()
      .then((data) => { if (mounted) setReports(data); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load submitted reports.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (r.summary && r.summary.toLowerCase().includes(search.toLowerCase())) ||
      (r.detectedEntities || []).some((e) => e.value.toLowerCase().includes(search.toLowerCase()));
    const matchesRisk = riskFilter === 'ALL' || r.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const columns: Column<Report>[] = [
    {
      key: 'id',
      header: 'Report ID',
      sortable: true,
      render: (r) => <span className="font-mono font-medium text-[#0078D4]">{r.id.substring(0, 8).toUpperCase()}…</span>,
    },
    {
      key: 'reportDate',
      header: 'Submitted Date',
      sortable: true,
      render: (r) => new Date(r.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'evidenceType',
      header: 'Type',
      render: (r) => <span className="font-medium text-[12px] bg-[#F3F2F1] px-2 py-0.5 rounded-[4px]">{r.evidenceType}</span>,
    },
    {
      key: 'riskScore',
      header: 'Risk Level',
      sortable: true,
      render: (r) => <RiskBadge risk={r.riskLevel} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-[#242424]">
          <span className="w-2 h-2 rounded-full bg-[#0078D4]" />
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${r.id}`)}>
          View Results →
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            My Submitted Reports
          </h1>
          <p className="text-[14px] text-[#605E5C] mt-0.5">
            Track and review all suspicious activity submissions you have made to Sentinel.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/report')}
          leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
        >
          New Report
        </Button>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">{error}</div>
      )}

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <div className="w-72">
          <Input
            placeholder="Search report ID or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">search</span>}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#605E5C] font-semibold">Filter Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="h-8 px-2 text-[12px] bg-white border border-[#E1DFDD] rounded-[4px] text-[#242424]"
          >
            <option value="ALL">All Risk Levels</option>
            <option value={RiskLevel.HIGH}>High Risk</option>
            <option value={RiskLevel.MEDIUM}>Medium Risk</option>
            <option value={RiskLevel.LOW}>Low Risk / Safe</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading reports…
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">folder_open</span>
          {reports.length === 0
            ? 'No reports submitted yet. Submit a new report to track threat analysis.'
            : 'No reports match your search query.'}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredReports}
          keyField="id"
          onRowClick={(r) => navigate(`/reports/${r.id}`)}
        />
      )}
    </div>
  );
};
