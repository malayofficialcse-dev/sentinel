import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors">
      {/* Header Navigation Shell matching Screen 1 */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50 flex items-center justify-between px-8 h-16 transition-colors">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 text-[var(--text-primary)] font-bold text-[16px] tracking-tight">
            <span className="material-symbols-outlined text-[var(--primary)] fill-1 text-[22px]">security</span>
            <span className="font-['Libre_Franklin',sans-serif]">SENTINEL</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-[13px] font-medium text-[var(--text-secondary)]">
            <a href="#pipeline" className="hover:text-[var(--primary)] transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">How It Works</a>
            <a href="#security" className="hover:text-[var(--primary)] transition-colors">Security</a>
            <Link to="/investigator" className="hover:text-[var(--primary)] transition-colors">For Investigators</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          {/* Day / Night Mode Toggle */}
          <ThemeToggle />

          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/report')}
            leftIcon={<span className="material-symbols-outlined text-[16px]">report</span>}
          >
            Report Something
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer matching Screen 1 */}
      <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] py-4 px-8 flex flex-col md:flex-row justify-between items-center text-[12px] text-[var(--text-secondary)] transition-colors">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span className="material-symbols-outlined text-[var(--text-muted)] text-[16px]">verified_user</span>
          <span>Privacy First. Enterprise Grade.</span>
        </div>
        <div>
          © 2026 SENTINEL Intelligence Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
