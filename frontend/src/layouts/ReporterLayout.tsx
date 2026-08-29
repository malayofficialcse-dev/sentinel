import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ReporterLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#242424] flex flex-col">
      {/* TopNavBar matching Screen 2 */}
      <header className="bg-white border-b border-[#E1DFDD] flex justify-between items-center w-full px-6 h-16 z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <NavLink to="/reporter" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0078D4] fill-1 text-[22px]">shield</span>
            <span className="text-[16px] font-bold text-[#242424] tracking-tight">SENTINEL</span>
          </NavLink>
          <nav className="hidden md:flex gap-4 ml-6 border-l border-[#E1DFDD] pl-6 h-8 items-center text-[13px] font-medium">
            <NavLink
              to="/reporter"
              end
              className={({ isActive }) =>
                `h-16 flex items-center px-2 transition-colors border-b-2 ${
                  isActive ? 'text-[#0078D4] border-[#0078D4] font-semibold' : 'text-[#605E5C] border-transparent hover:text-[#242424]'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `h-16 flex items-center px-2 transition-colors border-b-2 ${
                  isActive ? 'text-[#0078D4] border-[#0078D4] font-semibold' : 'text-[#605E5C] border-transparent hover:text-[#242424]'
                }`
              }
            >
              New Report
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `h-16 flex items-center px-2 transition-colors border-b-2 ${
                  isActive ? 'text-[#0078D4] border-[#0078D4] font-semibold' : 'text-[#605E5C] border-transparent hover:text-[#242424]'
                }`
              }
            >
              My Reports
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/investigator')}
            className="text-[12px] text-[#0078D4] hover:underline font-medium px-2 py-1 bg-[#EFF6FC] border border-[#B4D6F0] rounded-[4px]"
          >
            Investigator Portal →
          </button>
          <div className="w-8 h-8 rounded-[4px] bg-[#F3F2F1] border border-[#E1DFDD] overflow-hidden flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[#605E5C] text-[18px]">person</span>
            )}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-[#8A8886] hover:text-[#D13438] p-1"
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
      <footer className="w-full bg-white border-t border-[#E1DFDD] py-4 px-6 text-center text-[11px] text-[#605E5C] mt-auto">
        <span>🔒 Your evidence is processed with strict cryptographic verification and confidential handling.</span>
      </footer>
    </div>
  );
};
