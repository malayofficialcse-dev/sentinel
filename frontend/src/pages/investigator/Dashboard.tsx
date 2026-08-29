import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCases } from '../../data/mockData';
import { SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const InvestigatorDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F5] text-left">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header matching Screen 4 */}
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
              variant="secondary"
              size="md"
              leftIcon={<span className="material-symbols-outlined text-[16px]">download</span>}
            >
              Export Report
            </Button>
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

        {/* Stats Row matching Screen 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Open Cases</span>
              <span className="material-symbols-outlined text-[#0078D4] text-[20px]">work_outline</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#242424]">128</span>
              <span className="text-[12px] font-semibold text-[#107C10] flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px] border-l-4 border-l-[#D13438]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">High Risk</span>
              <span className="material-symbols-outlined text-[#D13438] text-[20px]">warning</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#D13438]">24</span>
              <span className="text-[12px] font-semibold text-[#D13438] flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 5%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Under Review</span>
              <span className="material-symbols-outlined text-[#8A8886] text-[20px]">pending_actions</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#242424]">17</span>
              <span className="text-[12px] text-[#605E5C] flex items-center">
                <span className="material-symbols-outlined text-[14px]">remove</span> 0%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[4px] border border-[#E1DFDD] p-4 flex flex-col justify-between h-[104px]">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Reports Today</span>
              <span className="material-symbols-outlined text-[#0078D4] text-[20px]">description</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#242424]">42</span>
              <span className="text-[12px] font-semibold text-[#107C10] flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 8%
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row matching Screen 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Case Volume Donut */}
          <div className="bg-white rounded-[4px] border border-[#E1DFDD] flex flex-col h-[320px]">
            <div className="px-4 py-3 border-b border-[#E1DFDD] bg-[#FAFAFA] rounded-t-[4px] flex justify-between items-center">
              <h3 className="text-[14px] font-bold text-[#242424]">Case Volume by Severity</h3>
              <button className="text-[#8A8886] hover:text-[#242424]">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center relative">
              <div className="w-44 h-44 rounded-full border-[16px] border-[#F3F2F1] relative flex items-center justify-center">
                <div
                  className="absolute inset-[-16px] rounded-full border-[16px] border-[#0078D4]"
                  style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)' }}
                />
                <div
                  className="absolute inset-[-16px] rounded-full border-[16px] border-[#D13438]"
                  style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0 100%, 0 50%)' }}
                />
                <div
                  className="absolute inset-[-16px] rounded-full border-[16px] border-[#CA5010]"
                  style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}
                />
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[24px] font-bold text-[#242424]">128</span>
                  <span className="text-[10px] font-semibold text-[#8A8886] uppercase">Total</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-[11px] text-[#605E5C]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#D13438]" /> High (24)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#CA5010]" /> Med (48)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0078D4]" /> Low (56)</span>
              </div>
            </div>
          </div>

          {/* Threat Trends (7 Days) */}
          <div className="bg-white rounded-[4px] border border-[#E1DFDD] flex flex-col h-[320px] lg:col-span-2">
            <div className="px-4 py-3 border-b border-[#E1DFDD] bg-[#FAFAFA] rounded-t-[4px] flex justify-between items-center">
              <h3 className="text-[14px] font-bold text-[#242424]">Threat Trends (Last 7 Days)</h3>
              <div className="flex gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0078D4]" /> Phishing Attacks</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D13438]" /> UPI Fraud / Mule Flow</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col relative w-full overflow-hidden">
              <div className="flex-1 border-l border-b border-[#E1DFDD] relative flex items-end">
                <div className="absolute w-full h-px bg-[#F3F2F1] bottom-[25%]" />
                <div className="absolute w-full h-px bg-[#F3F2F1] bottom-[50%]" />
                <div className="absolute w-full h-px bg-[#F3F2F1] bottom-[75%]" />

                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <path d="M 0,100 C 100,120 200,80 300,50 S 500,90 600,40 S 800,70 1000,20" fill="none" stroke="#0078D4" strokeWidth="2.5" />
                  <path d="M 0,150 C 150,140 250,180 350,110 S 550,130 650,80 S 850,120 1000,60" fill="none" stroke="#D13438" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-[#8A8886] px-1 font-mono">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Cases Table matching Screen 4 */}
        <div className="bg-white rounded-[4px] border border-[#E1DFDD] flex flex-col shadow-xs">
          <div className="px-4 py-3 border-b border-[#E1DFDD] bg-[#FAFAFA] rounded-t-[4px] flex justify-between items-center">
            <h3 className="text-[14px] font-bold text-[#242424]">Urgent Cases for Review</h3>
            <button
              onClick={() => navigate('/investigator/cases')}
              className="text-[12px] font-semibold text-[#0078D4] hover:underline cursor-pointer"
            >
              View All Cases ({mockCases.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#605E5C] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E1DFDD]">
                  <th className="px-4 py-2.5">Case ID</th>
                  <th className="px-4 py-2.5 w-1/3">Title</th>
                  <th className="px-4 py-2.5">Severity</th>
                  <th className="px-4 py-2.5">Assigned To</th>
                  <th className="px-4 py-2.5">Updated</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#242424] divide-y divide-[#E1DFDD]">
                {mockCases.slice(0, 4).map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/investigator/cases/${c.id}`)}
                    className="hover:bg-[#F3F2F1] cursor-pointer group transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[12px] text-[#605E5C] group-hover:text-[#0078D4] font-medium">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#242424]">
                      {c.title}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={c.severity} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[4px] bg-[#E1DFDD] overflow-hidden">
                          {c.assignedTo?.avatar ? (
                            <img src={c.assignedTo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[14px] text-[#605E5C] flex items-center justify-center h-full">
                              person
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] font-medium">{c.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#605E5C]">
                      {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        </div>
      </div>
    </div>
  );
};
