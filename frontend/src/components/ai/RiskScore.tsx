import React from 'react';
import { RiskLevel } from '../../types';

export interface RiskScoreProps {
  score: number;
  level?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  size = 'lg',
  showLabel = true,
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 85) return { text: 'text-[#D13438]', bg: 'bg-[#FDE7E9]', border: 'border-[#E6A6AA]', label: 'HIGH RISK' };
    if (s >= 65) return { text: 'text-[#CA5010]', bg: 'bg-[#FFF4CE]', border: 'border-[#F4C7A1]', label: 'MEDIUM RISK' };
    if (s >= 40) return { text: 'text-[#0078D4]', bg: 'bg-[#EFF6FC]', border: 'border-[#B4D6F0]', label: 'LOW RISK' };
    return { text: 'text-[#107C10]', bg: 'bg-[#F1FAF1]', border: 'border-[#A7D7A7]', label: 'SAFE' };
  };

  const colors = getScoreColor(score);

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border ${colors.bg} ${colors.border}`}>
        <span className={`text-[12px] font-bold ${colors.text}`}>{score}%</span>
        {showLabel && <span className={`text-[10px] font-semibold uppercase ${colors.text}`}>{colors.label}</span>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-6 flex flex-col items-center justify-center text-center shadow-xs">
      <div className={`px-3 py-1 rounded-[4px] ${colors.bg} border ${colors.border} mb-3`}>
        <span className={`text-[12px] font-bold uppercase tracking-wider ${colors.text}`}>
          {colors.label}
        </span>
      </div>
      <div className="flex items-baseline justify-center gap-1">
        <span className={`text-[48px] font-extrabold tracking-tight leading-none ${colors.text}`}>
          {score}
        </span>
        <span className="text-[18px] text-[#8A8886] font-medium">/ 100</span>
      </div>
      <p className="text-[13px] text-[#605E5C] max-w-xs mt-3 leading-relaxed">
        {score >= 85
          ? 'This content shows multiple severe indicators associated with fraudulent activity.'
          : score >= 65
            ? 'Suspicious indicators detected. Exercise caution and verify independently.'
            : 'Minimal risk indicators found. Content appears largely legitimate.'}
      </p>
    </div>
  );
};
