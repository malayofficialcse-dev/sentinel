import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-center max-w-md mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-[4px] bg-[var(--surface-hover)] text-[var(--text-secondary)] flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-semibold text-[15px] text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--text-secondary)] mb-4">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
