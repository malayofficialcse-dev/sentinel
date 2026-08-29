import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useThemeStore } from '../../store/themeStore';

export const SystemSettings: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-4xl">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)] font-['Libre_Franklin',sans-serif]">
          System Configuration & Preferences
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Configure display themes, threat intelligence ingestion thresholds, NLP models, and API keys.
        </p>
      </div>

      {/* Setting Section: Appearance & Day/Night Mode */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-5 flex flex-col gap-4 shadow-xs">
        <div>
          <h3 className="text-[14px] font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[var(--primary)]">palette</span>
            Appearance & Interface Theme
          </h3>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1">
            Choose your preferred color theme for daytime and nighttime operations across the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Day Mode */}
          <div
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-[4px] border-2 cursor-pointer transition-all flex flex-col gap-2 ${
              theme === 'light'
                ? 'border-[var(--primary)] bg-[var(--surface-secondary)] shadow-sm'
                : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-500">light_mode</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">Day Mode</span>
              </div>
              <input
                type="radio"
                name="theme"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="cursor-pointer text-[var(--primary)]"
              />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Clean, high-clarity light interface for well-lit environments.
            </p>
          </div>

          {/* Night Mode */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-[4px] border-2 cursor-pointer transition-all flex flex-col gap-2 ${
              theme === 'dark'
                ? 'border-[var(--primary)] bg-[var(--surface-secondary)] shadow-sm'
                : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-400">dark_mode</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">Night Mode</span>
              </div>
              <input
                type="radio"
                name="theme"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="cursor-pointer text-[var(--primary)]"
              />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Sleek dark interface tailored for low-light SOC analysis and night shifts.
            </p>
          </div>

          {/* System Default */}
          <div
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-[4px] border-2 cursor-pointer transition-all flex flex-col gap-2 ${
              theme === 'system'
                ? 'border-[var(--primary)] bg-[var(--surface-secondary)] shadow-sm'
                : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">devices</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">System Auto</span>
              </div>
              <input
                type="radio"
                name="theme"
                checked={theme === 'system'}
                onChange={() => setTheme('system')}
                className="cursor-pointer text-[var(--primary)]"
              />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Automatically switches between Day and Night according to your OS settings.
            </p>
          </div>
        </div>
      </div>

      {/* Setting Section 1: AI Parameters */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-5 flex flex-col gap-4 shadow-xs">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[var(--primary)]">psychology</span>
          AI Risk Thresholds
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="High Risk Alert Threshold (0-100)" defaultValue="85" type="number" />
          <Input label="Medium Risk Alert Threshold (0-100)" defaultValue="50" type="number" />
          <Input label="Auto-Escalate Severity Score" defaultValue="90" type="number" />
          <Input label="Minimum Entity Correlation Confidence (%)" defaultValue="75" type="number" />
        </div>
      </div>

      {/* Setting Section 2: External Threat Feeds */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-5 flex flex-col gap-4 shadow-xs">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[var(--primary)]">hub</span>
          External Threat Intel Feeds
        </h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[13px] text-[var(--text-primary)] cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded-[2px] text-[var(--primary)]" />
            <span>National Cyber Crime Threat Exchange (NCCTX) Sync</span>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[var(--text-primary)] cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded-[2px] text-[var(--primary)]" />
            <span>RBI Fraud Registry Feed Integration</span>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[var(--text-primary)] cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded-[2px] text-[var(--primary)]" />
            <span>OpenPhish & VirusTotal Live Lookup</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="md">Reset Defaults</Button>
        <Button variant="primary" size="md">Save Changes</Button>
      </div>
    </div>
  );
};
