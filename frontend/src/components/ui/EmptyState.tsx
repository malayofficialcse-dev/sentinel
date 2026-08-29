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
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-[#E1DFDD] rounded-[4px] text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-[4px] bg-[#F3F2F1] text-[#605E5C] flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-semibold text-[15px] text-[#242424] mb-1">{title}</h3>
      <p className="text-[13px] text-[#605E5C] mb-4">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
