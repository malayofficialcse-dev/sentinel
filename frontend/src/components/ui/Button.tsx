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
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0078D4] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-[12px] px-2.5 py-1 gap-1.5 h-7',
    md: 'text-[13px] px-3.5 py-1.5 gap-2 h-8',
    lg: 'text-[14px] px-4 py-2 gap-2 h-9',
  };

  const variantStyles = {
    primary: 'bg-[#0078D4] text-white hover:bg-[#106EBE] active:bg-[#005A9E] border border-transparent',
    secondary: 'bg-white text-[#242424] border border-[#C8C6C4] hover:bg-[#F3F2F1] active:bg-[#EDEBE9]',
    outline: 'bg-transparent text-[#242424] border border-[#E1DFDD] hover:bg-[#F3F2F1] active:bg-[#EDEBE9]',
    danger: 'bg-[#D13438] text-white hover:bg-[#A4262C] active:bg-[#791E23] border border-transparent',
    ghost: 'bg-transparent text-[#605E5C] hover:bg-[#F3F2F1] hover:text-[#242424] active:bg-[#EDEBE9] border border-transparent',
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
