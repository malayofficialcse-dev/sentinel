import React from 'react';
import { RiskIndicator } from '../../types';
import { SeverityBadge } from '../ui/Badge';

export interface RiskBreakdownProps {
  indicators: RiskIndicator[];
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ indicators }) => {
  return (
    <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 flex flex-col gap-3">
      <div className="border-b border-[#E1DFDD] pb-2 flex items-center justify-between">
        <h4 className="font-semibold text-[14px] text-[#242424] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0078D4] text-[18px]">psychology</span>
          Why is this risky?
        </h4>
        <span className="text-[11px] text-[#605E5C] font-mono">Score Breakdown</span>
      </div>

      <div className="space-y-2.5">
        {indicators.map((ind, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] flex flex-col gap-1.5 hover:border-[#0078D4] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono font-bold text-[#D13438] bg-[#FDE7E9] px-1.5 py-0.5 rounded-[4px]">
                  +{ind.score}
                </span>
                <span className="text-[13px] font-semibold text-[#242424]">{ind.title}</span>
              </div>
              <SeverityBadge severity={ind.severity} size="sm" />
            </div>
            <p className="text-[12px] text-[#605E5C] leading-normal">{ind.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
