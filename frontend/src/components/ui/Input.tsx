import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label htmlFor={inputId} className="text-[12px] font-semibold text-[#323130]">
            {label}
            {props.required && <span className="text-[#D13438] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-2.5 text-[#8A8886] flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'w-full h-8 text-[13px] bg-white text-[#242424] placeholder-[#8A8886] border rounded-[4px] transition-colors focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#F3F2F1] disabled:text-[#A19F9D]',
                leftIcon ? 'pl-8' : 'pl-3',
                rightIcon ? 'pr-8' : 'pr-3',
                error ? 'border-[#D13438] focus:border-[#D13438] focus:ring-[#D13438]' : 'border-[#E1DFDD]',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 text-[#8A8886] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-[11px] text-[#D13438]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[#605E5C]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
