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
          'bg-white border border-[#E1DFDD] rounded-[4px] overflow-hidden transition-colors',
          isClickable && 'hover:border-[#0078D4] hover:bg-[#FAFAFA] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {(header || headerAction) && (
        <div className="px-4 py-3 border-b border-[#E1DFDD] bg-[#FAFAFA] flex items-center justify-between">
          <div className="font-semibold text-[14px] text-[#242424]">{header}</div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-2.5 border-t border-[#E1DFDD] bg-[#FAFAFA]">{footer}</div>}
    </div>
  );
};
