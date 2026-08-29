import React from 'react';
import { useThemeStore, ThemeMode } from '../../store/themeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-0.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[4px] ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[3px] transition-all ${
            theme === 'light'
              ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title="Day Mode (Light)"
        >
          <span className="material-symbols-outlined text-[16px]">light_mode</span>
          <span>Day</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[3px] transition-all ${
            theme === 'dark'
              ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title="Night Mode (Dark)"
        >
          <span className="material-symbols-outlined text-[16px]">dark_mode</span>
          <span>Night</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[3px] transition-all ${
            theme === 'system'
              ? 'bg-[var(--surface)] text-[var(--primary)] shadow-xs font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title="Match System Theme"
        >
          <span className="material-symbols-outlined text-[16px]">devices</span>
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // Default compact icon button
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-center cursor-pointer relative group ${className}`}
      title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
      aria-label={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:rotate-12">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="sr-only">{isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}</span>
    </button>
  );
};
