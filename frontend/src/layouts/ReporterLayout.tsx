import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const ReporterLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col transition-colors">
      {/* TopNavBar */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center w-full px-6 h-16 z-50 sticky top-0 transition-colors">
        <div className="flex items-center gap-6">
          <NavLink to="/reporter" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)] fill-1 text-[22px]">shield</span>
            <span className="text-[16px] font-bold text-[var(--text-primary)] tracking-tight">SENTINEL</span>
          </NavLink>
          <nav className="hidden md:flex gap-4 ml-6 border-l border-[var(--border)] pl-6 h-8 items-center text-[13px] font-medium">
            <NavLink
              to="/reporter"
              end
              className={({ isActive }) =>
                `h-16 flex items-center px-2 transition-colors border-b-2 ${
                  isActive ? 'text-[var(--primary)] border-[var(--primary)] font-semibold' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `h-16 flex items-center px-2 transition-colors border-b-2 ${
                  isActive ? 'text-[var(--primary)] border-[var(--primary)] font-semibold' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                }`
              }
            >
              New Report
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `h-16 flex items-center px-2 transition-colors border-b-2 ${
                  isActive ? 'text-[var(--primary)] border-[var(--primary)] font-semibold' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                }`
              }
            >
              My Reports
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Night Theme Toggle */}
          <ThemeToggle />

          <button
            onClick={() => navigate('/investigator')}
            className="text-[12px] text-[var(--primary)] hover:underline font-medium px-2.5 py-1 bg-[var(--info-bg)] border border-[var(--info-border)] rounded-[4px] cursor-pointer"
          >
            Investigator Portal →
          </button>
          <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[var(--text-secondary)] text-[18px]">person</span>
            )}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-[var(--text-muted)] hover:text-[var(--danger)] p-1 cursor-pointer transition-colors"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] py-4 px-6 text-center text-[11px] text-[var(--text-secondary)] mt-auto transition-colors">
        <span>🔒 Your evidence is processed with strict cryptographic verification and confidential handling.</span>
      </footer>
    </div>
  );
};
