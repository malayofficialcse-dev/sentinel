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
    default: 'bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)]',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger-border)]',
    info: 'bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info-border)]',
    neutral: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]',
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
        <Badge variant="danger" size={size} className="bg-[var(--danger)] text-white border-transparent">
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
