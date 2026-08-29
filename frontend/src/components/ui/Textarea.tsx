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
          <label htmlFor={textareaId} className="text-[12px] font-semibold text-[var(--text-body)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={twMerge(
            clsx(
              'w-full p-2.5 text-[13px] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-[4px] transition-colors focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--text-muted)]',
              error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : 'border-[var(--border)]',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span className="text-[11px] text-[var(--danger)]">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-[var(--text-secondary)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
