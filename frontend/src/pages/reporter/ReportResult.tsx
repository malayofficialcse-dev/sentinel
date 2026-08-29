import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockReports } from '../../data/mockData';
import { RiskScore } from '../../components/ai/RiskScore';
import { RiskBreakdown } from '../../components/ai/RiskBreakdown';
import { Button } from '../../components/ui/Button';

export const ReportResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = mockReports.find((r) => r.id === id) || mockReports[0];

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 text-left">
      {/* Header with Breadcrumb & ID */}
      <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#605E5C] uppercase tracking-wider font-semibold">
            <span>Reports</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0078D4]">{report.id}</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif] mt-1">
            Analysis Result & Safety Guidance
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<span className="material-symbols-outlined text-[16px]">download</span>}
            onClick={() => window.print()}
          >
            Download Summary
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/report')}
            leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
          >
            Report Another
          </Button>
        </div>
      </div>

      {/* Main Score + Explanation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Risk Card (Left) */}
        <div className="md:col-span-1">
          <RiskScore score={report.riskScore} level={report.riskLevel} />
        </div>

        {/* Risk Breakdown (Right 2 cols) */}
        <div className="md:col-span-2">
          <RiskBreakdown indicators={report.riskIndicators} />
        </div>
      </div>

      {/* Detected Information Table */}
      <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 shadow-xs">
        <div className="border-b border-[#E1DFDD] pb-2 mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[14px] text-[#242424] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0078D4] text-[18px]">fingerprint</span>
            Information Detected in Evidence
          </h3>
          <span className="text-[11px] text-[#605E5C]">{report.detectedEntities.length} Entities Extracted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {report.detectedEntities.map((entity, idx) => (
            <div key={idx} className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">{entity.type}</span>
              <span className="text-[13px] font-mono font-semibold text-[#242424] truncate">{entity.value}</span>
              <span className="text-[10px] text-[#107C10] font-semibold mt-0.5">✓ {entity.confidence}% Confidence</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-5 shadow-xs">
        <div className="border-b border-[#E1DFDD] pb-2 mb-3">
          <h3 className="font-semibold text-[15px] text-[#242424] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#107C10] text-[20px] fill-1">verified_user</span>
            Recommended Safety Actions
          </h3>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px] text-[#323130]">
          {report.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 p-2.5 bg-[#F1FAF1] border border-[#A7D7A7] rounded-[4px]">
              <span className="material-symbols-outlined text-[#107C10] text-[18px] shrink-0 mt-0.5">check</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
