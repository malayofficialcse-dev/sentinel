import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../services/reportApi';
import { Report } from '../../types';

export const ReporterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    reportApi.getReports()
      .then((data) => { if (mounted) setReports(data); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const evidenceOptions = [
    {
      icon: 'image',
      title: 'Upload Image',
      description: 'Screenshots of emails, texts, or suspicious websites.',
      type: 'IMAGE',
    },
    {
      icon: 'picture_as_pdf',
      title: 'Upload PDF',
      description: 'Invoices, legal threats, or unexpected attachments.',
      type: 'PDF',
    },
    {
      icon: 'link',
      title: 'Paste URL',
      description: 'Suspicious links, phishing sites, or shortened URLs.',
      type: 'URL',
    },
    {
      icon: 'qr_code_scanner',
      title: 'Upload QR Code',
      description: 'Codes from physical mail, posters, or digital messages.',
      type: 'QR_CODE',
    },
    {
      icon: 'chat',
      title: 'Paste Message',
      description: 'Raw text from SMS, WhatsApp, or social media DMs.',
      type: 'MESSAGE',
    },
    {
      icon: 'receipt_long',
      title: 'Transaction Details',
      description: 'Suspicious crypto addresses or bank transfer requests.',
      type: 'TRANSACTION',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Hero Section */}
      <section className="flex flex-col gap-1 max-w-2xl text-left">
        <h1 className="text-[28px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif] tracking-tight">
          Submit Suspicious Activity
        </h1>
        <p className="text-[15px] text-[#605E5C]">
          Have you received something suspicious? Upload it and Sentinel will help analyze it to keep you safe.
        </p>
      </section>

      {/* Evidence Options Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidenceOptions.map((opt) => (
          <button
            key={opt.title}
            onClick={() => navigate(`/report?type=${opt.type}`)}
            className="flex flex-col items-start p-5 bg-white border border-[#E1DFDD] rounded-[4px] hover:border-[#0078D4] hover:bg-[#FAFAFA] transition-all duration-150 group text-left cursor-pointer shadow-xs"
          >
            <div className="w-12 h-12 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] flex items-center justify-center mb-4 group-hover:bg-[#0078D4] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[24px]">{opt.icon}</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#242424] mb-1">{opt.title}</h3>
            <p className="text-[13px] text-[#605E5C] leading-normal">{opt.description}</p>
          </button>
        ))}
      </section>

      {/* Privacy Note */}
      <div className="bg-[#EFF6FC] text-[#005A9E] rounded-[4px] p-4 flex items-center gap-3 border border-[#B4D6F0]">
        <span className="material-symbols-outlined text-[#0078D4] fill-1 text-[22px]">lock</span>
        <p className="text-[13px] text-[#323130] leading-normal">
          <strong className="text-[#005A9E]">Privacy Assurance:</strong> Your evidence is securely processed. Original evidence is cryptographically preserved and kept strictly confidential.
        </p>
      </div>

      {/* My Recent Reports Section */}
      <section className="flex flex-col gap-3 mt-4">
        <div className="flex justify-between items-end border-b border-[#E1DFDD] pb-2">
          <h2 className="text-[18px] font-bold text-[#242424]">My Recent Reports</h2>
          <button
            onClick={() => navigate('/reports')}
            className="text-[13px] font-semibold text-[#0078D4] hover:underline cursor-pointer"
          >
            View All ({reports.length})
          </button>
        </div>

        <div className="bg-white border border-[#E1DFDD] rounded-[4px] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-[#605E5C]">
              <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#605E5C]">
              <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">description</span>
              No reports submitted yet. Choose an option above to submit suspicious activity.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E1DFDD]">
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider w-36">
                    Report ID
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider w-44">
                    Date Submitted
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider w-36">
                    Risk Level
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider text-right w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1DFDD] text-[13px]">
                {reports.slice(0, 5).map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className="hover:bg-[#F3F2F1] transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-[12px] font-medium text-[#242424]">
                      {report.id.substring(0, 8).toUpperCase()}…
                    </td>
                    <td className="py-3 px-4 text-[#605E5C]">
                      {new Date(report.reportDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {report.riskScore >= 70 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#FDE7E9] text-[#D13438] border border-[#E6A6AA] text-[11px] font-bold">
                          High Risk ({report.riskScore})
                        </span>
                      ) : report.riskScore >= 40 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#FFF4CE] text-[#CA5010] border border-[#F4C7A1] text-[11px] font-bold">
                          Medium Risk ({report.riskScore})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7] text-[11px] font-bold">
                          Safe ({report.riskScore})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#242424]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            report.status === 'RESOLVED' || report.status === 'ANALYSIS_COMPLETE'
                              ? 'bg-[#107C10]'
                              : report.status === 'INVESTIGATING'
                                ? 'bg-[#0078D4]'
                                : 'bg-[#8A8886]'
                          }`}
                        />
                        <span>{report.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-[#0078D4] text-[12px] font-semibold hover:underline">
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};
