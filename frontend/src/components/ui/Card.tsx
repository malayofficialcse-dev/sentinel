import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  isClickable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  headerAction,
  footer,
  className,
  isClickable = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-[4px] overflow-hidden transition-colors shadow-xs',
          isClickable && 'hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {(header || headerAction) && (
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
          <div className="font-semibold text-[14px] text-[var(--text-primary)]">{header}</div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface-secondary)]">{footer}</div>}
    </div>
  );
};
