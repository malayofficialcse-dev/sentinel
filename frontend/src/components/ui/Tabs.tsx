import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center border-b border-[var(--border)] bg-[var(--surface)] gap-1 px-4 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-[13px] font-medium border-b-2 transition-colors select-none whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-[var(--primary)] text-[var(--primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
            }`}
          >
            {tab.icon && (
              <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-[4px] font-bold ${
                  isActive ? 'bg-[var(--info-bg)] text-[var(--primary)]' : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
