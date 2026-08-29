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
          <label htmlFor={inputId} className="text-[12px] font-semibold text-[var(--text-body)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-2.5 text-[var(--text-muted)] flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'w-full h-8 text-[13px] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-[4px] transition-colors focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--text-muted)]',
                leftIcon ? 'pl-8' : 'pl-3',
                rightIcon ? 'pr-8' : 'pr-3',
                error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : 'border-[var(--border)]',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 text-[var(--text-muted)] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-[11px] text-[var(--danger)]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[var(--text-secondary)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
