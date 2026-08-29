import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-[12px] font-semibold text-[#323130]">
            {label}
            {props.required && <span className="text-[#D13438] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={twMerge(
            clsx(
              'w-full p-2.5 text-[13px] bg-white text-[#242424] placeholder-[#8A8886] border rounded-[4px] transition-colors focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#F3F2F1] disabled:text-[#A19F9D]',
              error ? 'border-[#D13438] focus:border-[#D13438] focus:ring-[#D13438]' : 'border-[#E1DFDD]',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span className="text-[11px] text-[#D13438]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[#605E5C]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
