import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label htmlFor={selectId} className="text-[12px] font-semibold text-[var(--text-body)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'w-full h-8 px-3 text-[13px] bg-[var(--surface)] text-[var(--text-primary)] border rounded-[4px] transition-colors focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:bg-[var(--surface-hover)]',
              error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
              className
            )
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text-primary)]">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="text-[11px] text-[var(--danger)]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[var(--text-secondary)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
