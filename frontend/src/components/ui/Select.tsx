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
          <label htmlFor={selectId} className="text-[12px] font-semibold text-[#323130]">
            {label}
            {props.required && <span className="text-[#D13438] ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'w-full h-8 px-3 text-[13px] bg-white text-[#242424] border rounded-[4px] transition-colors focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#F3F2F1]',
              error ? 'border-[#D13438]' : 'border-[#E1DFDD]',
              className
            )
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="text-[11px] text-[#D13438]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[#605E5C]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
