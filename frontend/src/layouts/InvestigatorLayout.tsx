import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../types';

export const InvestigatorLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { hasPermission } = useAuthStore();
  const location = useLocation();
  const requiredPermission = location.pathname.startsWith('/investigator/cases')
    ? Permission.VIEW_ALL_CASES
    : location.pathname.startsWith('/investigator/evidence')
      ? Permission.VIEW_EVIDENCE
      : location.pathname.startsWith('/investigator/entities')
        ? Permission.VIEW_ENTITIES
        : location.pathname.startsWith('/investigator/graph')
          ? Permission.VIEW_GRAPH
          : location.pathname.startsWith('/investigator/threat-intelligence')
            ? Permission.VIEW_THREAT_INTEL
            : location.pathname.startsWith('/investigator/financial')
              ? Permission.VIEW_FINANCIAL
              : location.pathname.startsWith('/investigator/models')
                ? Permission.VIEW_AI_AGENTS
                : location.pathname.startsWith('/investigator/findings')
                  ? Permission.VIEW_FINDINGS
                  : location.pathname.startsWith('/investigator/reports')
                    ? Permission.VIEW_REPORTS
                    : null;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/permission-denied" replace />;
  }

  return (
    <div className="h-screen w-screen flex bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors">
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
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
