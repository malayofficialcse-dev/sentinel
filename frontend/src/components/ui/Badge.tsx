import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Severity, RiskLevel, CaseStatus, FindingStatus, ReportStatus } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-none font-semibold',
    md: 'text-[11px] px-2 py-0.5 font-semibold',
  };

  const variantStyles = {
    default: 'bg-[#F3F2F1] text-[#323130] border border-[#E1DFDD]',
    success: 'bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7]',
    warning: 'bg-[#FFF4CE] text-[#CA5010] border border-[#F4C7A1]',
    danger: 'bg-[#FDE7E9] text-[#D13438] border border-[#E6A6AA]',
    info: 'bg-[#EFF6FC] text-[#0078D4] border border-[#B4D6F0]',
    neutral: 'bg-[#FAFAFA] text-[#605E5C] border border-[#E1DFDD]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 rounded-[4px] uppercase tracking-wider',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: Severity; size?: 'sm' | 'md' }> = ({
  severity,
  size = 'md',
}) => {
  switch (severity) {
    case Severity.CRITICAL:
      return (
        <Badge variant="danger" size={size} className="bg-[#A4262C] text-white border-transparent">
          <span className="material-symbols-outlined text-[12px]">error</span>
          CRITICAL
        </Badge>
      );
    case Severity.HIGH:
      return (
        <Badge variant="danger" size={size}>
          <span className="material-symbols-outlined text-[12px]">warning</span>
          HIGH
        </Badge>
      );
    case Severity.MEDIUM:
      return (
        <Badge variant="warning" size={size}>
          <span className="material-symbols-outlined text-[12px]">info</span>
          MEDIUM
        </Badge>
      );
    case Severity.LOW:
      return (
        <Badge variant="success" size={size}>
          <span className="material-symbols-outlined text-[12px]">check_circle</span>
          LOW
        </Badge>
      );
    default:
      return <Badge size={size}>{severity}</Badge>;
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel | number; size?: 'sm' | 'md' }> = ({
  risk,
  size = 'md',
}) => {
  if (typeof risk === 'number') {
    if (risk >= 85) return <Badge variant="danger" size={size}>High Risk ({risk})</Badge>;
    if (risk >= 50) return <Badge variant="warning" size={size}>Medium Risk ({risk})</Badge>;
    return <Badge variant="success" size={size}>Low Risk ({risk})</Badge>;
  }

  switch (risk) {
    case RiskLevel.CRITICAL:
      return <Badge variant="danger" size={size}>CRITICAL</Badge>;
    case RiskLevel.HIGH:
      return <Badge variant="danger" size={size}>HIGH RISK</Badge>;
    case RiskLevel.MEDIUM:
      return <Badge variant="warning" size={size}>MEDIUM</Badge>;
    case RiskLevel.LOW:
    case RiskLevel.SAFE:
      return <Badge variant="success" size={size}>SAFE</Badge>;
    default:
      return <Badge size={size}>{risk}</Badge>;
  }
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case CaseStatus.INVESTIGATING:
      return <Badge variant="info" size={size}>Investigating</Badge>;
    case CaseStatus.ESCALATED:
      return <Badge variant="danger" size={size}>Escalated</Badge>;
    case CaseStatus.UNDER_REVIEW:
      return <Badge variant="warning" size={size}>Under Review</Badge>;
    case CaseStatus.OPEN:
      return <Badge variant="default" size={size}>Open</Badge>;
    case CaseStatus.RESOLVED:
      return <Badge variant="success" size={size}>Resolved</Badge>;
    case CaseStatus.CLOSED:
      return <Badge variant="neutral" size={size}>Closed</Badge>;
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};
