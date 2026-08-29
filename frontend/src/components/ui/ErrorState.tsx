import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = "We couldn't load this information. Your original submission and data are safe.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-[#E6A6AA] rounded-[4px] text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-[4px] bg-[#FDE7E9] text-[#D13438] flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[28px]">error_outline</span>
      </div>
      <h3 className="font-semibold text-[15px] text-[#242424] mb-1">{title}</h3>
      <p className="text-[13px] text-[#605E5C] mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry} leftIcon={<span className="material-symbols-outlined text-[16px]">refresh</span>}>
          Try Again
        </Button>
      )}
    </div>
  );
};
