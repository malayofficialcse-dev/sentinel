import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-[12px] px-2.5 py-1 gap-1.5 h-7',
    md: 'text-[13px] px-3.5 py-1.5 gap-2 h-8',
    lg: 'text-[14px] px-4 py-2 gap-2 h-9',
  };

  const variantStyles = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:bg-[var(--primary-dark)] border border-transparent shadow-xs',
    secondary: 'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-selected)] shadow-xs',
    outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-selected)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90 active:opacity-80 border border-transparent shadow-xs',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:bg-[var(--surface-selected)] border border-transparent',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
      ) : (
        leftIcon && <span className="inline-flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};
