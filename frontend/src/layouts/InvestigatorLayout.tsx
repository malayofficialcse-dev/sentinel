import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { useUIStore } from '../store/uiStore';

export const InvestigatorLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="h-screen w-screen flex bg-[#F5F5F5] text-[#242424] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        {/* Top Navbar */}
        <TopNav />

        {/* Dynamic Workspace Route View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F5F5F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
