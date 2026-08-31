import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseApi } from '../../services/caseApi';
import { dashboardApi, DashboardStats } from '../../services/dashboardApi';
import { SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Case } from '../../types';

export const InvestigatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([caseApi.getCases(), dashboardApi.getStats()])
      .then(([fetchedCases, fetchedStats]) => {
        if (!mounted) return;
        setCases(fetchedCases);
        setStats(fetchedStats);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load dashboard. Please verify the backend is running.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F5] text-left">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
              Investigator Dashboard
            </h1>
            <p className="text-[13px] text-[#605E5C] mt-0.5">
              Real-time overview of active investigations and threat intelligence.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/investigator/cases')}
              leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
            >
              New Case
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-4 text-[#A4262C] text-[13px]">
            <span className="material-symbols-outlined text-[16px] mr-2 align-middle">error</span>
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Open Cases</span>
              <span className="material-symbols-outlined text-[#0078D4] text-[20px]">work_outline</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#242424]">
                {loading ? '—' : (stats?.openCases ?? 0)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px] border-l-4 border-l-[#D13438]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">High / Critical Risk</span>
              <span className="material-symbols-outlined text-[#D13438] text-[20px]">warning</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#D13438]">
                {loading ? '—' : (stats?.highRiskCases ?? 0)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Total Evidence</span>
              <span className="material-symbols-outlined text-[#8A8886] text-[20px]">folder_open</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#242424]">
                {loading ? '—' : (stats?.totalEvidence ?? 0)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">AI Findings</span>
              <span className="material-symbols-outlined text-[#0078D4] text-[20px]">psychology</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#242424]">
                {loading ? '—' : (stats?.totalFindings ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Cases Table */}
        <div className="bg-white rounded-[4px] border border-[#E1DFDD] flex flex-col shadow-xs">
          <div className="px-4 py-3 border-b border-[#E1DFDD] bg-[#FAFAFA] rounded-t-[4px] flex justify-between items-center">
            <h3 className="text-[14px] font-bold text-[#242424]">Recent Cases</h3>
            <button
              onClick={() => navigate('/investigator/cases')}
              className="text-[12px] font-semibold text-[#0078D4] hover:underline cursor-pointer"
            >
              View All Cases ({loading ? '…' : cases.length})
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[13px] text-[#605E5C]">
              <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
              Loading cases…
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#605E5C]">
              <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">folder_open</span>
              No cases found. Create a new case to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#FAFAFA] text-[#605E5C] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E1DFDD]">
                    <th className="px-4 py-2.5">Case ID</th>
                    <th className="px-4 py-2.5 w-1/3">Title</th>
                    <th className="px-4 py-2.5">Severity</th>
                    <th className="px-4 py-2.5">Risk</th>
                    <th className="px-4 py-2.5">Updated</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#242424] divide-y divide-[#E1DFDD]">
                  {cases.slice(0, 8).map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/investigator/cases/${c.id}`)}
                      className="hover:bg-[#F3F2F1] cursor-pointer group transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-[12px] text-[#605E5C] group-hover:text-[#0078D4] font-medium">
                        {c.id.substring(0, 8).toUpperCase()}…
                      </td>
                      <td className="px-4 py-3 font-medium text-[#242424]">{c.title}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={c.severity} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px]">
                        <span className={c.riskScore >= 70 ? 'text-[#D13438] font-bold' : c.riskScore >= 40 ? 'text-[#CA5010]' : 'text-[#107C10]'}>
                          {c.riskScore}/100
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#605E5C]">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-[#8A8886] group-hover:text-[#0078D4] transition-colors">
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
