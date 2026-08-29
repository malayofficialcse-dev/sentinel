import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#242424]">
      {/* Header Navigation Shell matching Screen 1 */}
      <header className="bg-white border-b border-[#E1DFDD] sticky top-0 z-50 flex items-center justify-between px-8 h-16">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 text-[#242424] font-bold text-[16px] tracking-tight">
            <span className="material-symbols-outlined text-[#0078D4] fill-1 text-[22px]">security</span>
            <span className="font-['Libre_Franklin',sans-serif]">SENTINEL</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-[13px] font-medium text-[#605E5C]">
            <a href="#pipeline" className="hover:text-[#0078D4] transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-[#0078D4] transition-colors">How It Works</a>
            <a href="#security" className="hover:text-[#0078D4] transition-colors">Security</a>
            <Link to="/investigator" className="hover:text-[#0078D4] transition-colors">For Investigators</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
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
      <footer className="w-full bg-white border-t border-[#E1DFDD] py-4 px-8 flex flex-col md:flex-row justify-between items-center text-[12px] text-[#605E5C]">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span className="material-symbols-outlined text-[#8A8886] text-[16px]">verified_user</span>
          <span>Privacy First. Enterprise Grade.</span>
        </div>
        <div>
          © 2026 SENTINEL Intelligence Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
