import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../types';

/** Shared workspace shell for the Report Center and Investigation modules. */
export const ReporterLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { hasPermission } = useAuthStore();
  const location = useLocation();
  const requiredPermission = location.pathname === '/report'
    ? Permission.CREATE_REPORT
    : location.pathname.startsWith('/reports')
      ? Permission.VIEW_OWN_REPORTS
      : Permission.SUBMIT_REPORT;

  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/permission-denied" replace />;
  }

  return (
    <div className="h-screen w-screen flex bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors">
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
          <div className="w-full max-w-[1400px] mx-auto px-6 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
