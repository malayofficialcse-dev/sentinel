import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Permission, UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  permission?: Permission;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const isInvestigationPortal = location.pathname.startsWith('/investigator') || location.pathname.startsWith('/admin');

  const mainNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/investigator', icon: 'dashboard', permission: Permission.VIEW_ALL_CASES },
    { label: 'Cases', path: '/investigator/cases', icon: 'work', badge: '128', permission: Permission.VIEW_ALL_CASES },
    { label: 'Evidence', path: '/investigator/evidence', icon: 'inventory_2', permission: Permission.VIEW_EVIDENCE },
    { label: 'Entities', path: '/investigator/entities', icon: 'groups', permission: Permission.VIEW_ENTITIES },
    { label: 'AI Model Hub', path: '/investigator/models', icon: 'model_training', badge: '3', permission: Permission.VIEW_AI_AGENTS },
    { label: 'Threat Intelligence', path: '/investigator/threat-intelligence', icon: 'security', permission: Permission.VIEW_THREAT_INTEL },
    { label: 'Financial', path: '/investigator/financial', icon: 'payments', permission: Permission.VIEW_FINANCIAL },
    { label: 'Graph', path: '/investigator/graph', icon: 'hub', permission: Permission.VIEW_GRAPH },
    { label: 'Findings', path: '/investigator/findings', icon: 'fact_check', badge: '3', permission: Permission.VIEW_FINDINGS },
    { label: 'Case Reports', path: '/investigator/reports', icon: 'description', permission: Permission.VIEW_REPORTS },
  ];

  const reportNavItems: NavItem[] = [
    { label: 'Reporter Dashboard', path: '/reporter', icon: 'home', permission: Permission.SUBMIT_REPORT },
    { label: 'New Report', path: '/report', icon: 'add_circle', permission: Permission.CREATE_REPORT },
    { label: 'My Reports', path: '/reports', icon: 'description', permission: Permission.VIEW_OWN_REPORTS },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Administration', path: '/admin', icon: 'settings_applications', permission: Permission.MANAGE_USERS },
  ];
  const { hasPermission } = useAuthStore();
  const visibleReportItems = reportNavItems.filter((item) => !item.permission || hasPermission(item.permission));
  const visibleMainItems = mainNavItems.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-40 transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="px-4 h-16 border-b border-[var(--border)] flex items-center justify-between">
        <NavLink to={isInvestigationPortal ? '/investigator' : '/reporter'} className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-[4px] bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px] fill-1 text-white">shield</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate text-left">
              <span className="font-bold text-[15px] text-[var(--text-primary)] tracking-tight leading-none">SENTINEL</span>
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mt-1">
                {isInvestigationPortal ? 'Investigation' : 'Report Center'}
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-[4px] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {!isInvestigationPortal && (
          <>
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
              REPORT CENTER
            </div>
            {visibleReportItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/reporter' || item.path === '/report'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] font-medium transition-colors select-none group relative ${
                    isActive
                      ? 'bg-[var(--surface-selected)] text-[var(--primary)] font-semibold border-l-3 border-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-[20px] shrink-0 ${isActive ? 'text-[var(--primary)] fill-1' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}

        {isInvestigationPortal && (
          <>
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
              INVESTIGATION WORKSPACE
            </div>
            {visibleMainItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/investigator'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] font-medium transition-colors select-none group relative ${
                    isActive
                      ? 'bg-[var(--surface-selected)] text-[var(--primary)] font-semibold border-l-3 border-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-[20px] shrink-0 ${isActive ? 'text-[var(--primary)] fill-1' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold ${isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}

        {isInvestigationPortal && role === UserRole.ADMIN && (
          <>
            <div className="my-2 border-t border-[var(--border)]" />
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] font-medium transition-colors select-none group ${
                    isActive
                      ? 'bg-[var(--surface-selected)] text-[var(--primary)] font-semibold border-l-3 border-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px] shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer Navigation */}
      {isInvestigationPortal && (
      <div className="p-2 border-t border-[var(--border)] space-y-0.5">
        <NavLink
          to="/investigator/help"
          className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[12px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
          {!sidebarCollapsed && <span>Help Center</span>}
        </NavLink>
        <NavLink
          to="/investigator/status"
          className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[12px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
          {!sidebarCollapsed && <span>System Status</span>}
        </NavLink>
      </div>
      )}
    </aside>
  );
};
