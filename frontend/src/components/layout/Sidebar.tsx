import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const mainNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/investigator', icon: 'dashboard' },
    { label: 'Cases', path: '/investigator/cases', icon: 'work', badge: '128' },
    { label: 'Evidence', path: '/investigator/evidence', icon: 'inventory_2' },
    { label: 'Entities', path: '/investigator/entities', icon: 'groups' },
    { label: 'Threat Intelligence', path: '/investigator/threat-intelligence', icon: 'security' },
    { label: 'Financial', path: '/investigator/financial', icon: 'payments' },
    { label: 'Graph', path: '/investigator/graph', icon: 'hub' },
    { label: 'AI Agents', path: '/investigator/agents', icon: 'psychology' },
    { label: 'Findings', path: '/investigator/findings', icon: 'fact_check', badge: '3' },
    { label: 'Reports', path: '/investigator/reports', icon: 'description' },
    { label: 'Audit Logs', path: '/investigator/audit', icon: 'analytics' },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Administration', path: '/admin', icon: 'settings_applications' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#FFFFFF] border-r border-[#E1DFDD] flex flex-col z-40 transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="px-4 h-16 border-b border-[#E1DFDD] flex items-center justify-between">
        <NavLink to="/investigator" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-[4px] bg-[#0078D4] text-white flex items-center justify-center font-bold text-sm shrink-0">
            <span className="material-symbols-outlined text-[20px] fill-1 text-white">shield</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-[15px] text-[#242424] tracking-tight leading-none">SENTINEL</span>
              <span className="text-[10px] text-[#605E5C] uppercase tracking-wider font-semibold mt-1">Investigation</span>
            </div>
          )}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="text-[#605E5C] hover:text-[#242424] p-1 rounded-[4px] hover:bg-[#F3F2F1] transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/investigator'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] font-medium transition-colors select-none group relative ${
                isActive
                  ? 'bg-[#E8F1FB] text-[#005A9E] font-semibold border-l-3 border-[#0078D4]'
                  : 'text-[#605E5C] hover:bg-[#F3F2F1] hover:text-[#242424]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 ${
                    isActive ? 'text-[#0078D4] fill-1' : 'text-[#605E5C] group-hover:text-[#242424]'
                  }`}
                >
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-[4px] font-bold ${
                      isActive ? 'bg-[#0078D4] text-white' : 'bg-[#EDEBE9] text-[#605E5C]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {role === UserRole.ADMIN && (
          <>
            <div className="my-2 border-t border-[#E1DFDD]" />
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] font-medium transition-colors select-none group ${
                    isActive
                      ? 'bg-[#E8F1FB] text-[#005A9E] font-semibold border-l-3 border-[#0078D4]'
                      : 'text-[#605E5C] hover:bg-[#F3F2F1] hover:text-[#242424]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px] shrink-0 text-[#605E5C] group-hover:text-[#242424]">
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer Navigation */}
      <div className="p-2 border-t border-[#E1DFDD] space-y-0.5">
        <NavLink
          to="/investigator/help"
          className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[12px] text-[#605E5C] hover:bg-[#F3F2F1] hover:text-[#242424]"
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
          {!sidebarCollapsed && <span>Help Center</span>}
        </NavLink>
        <NavLink
          to="/investigator/status"
          className="flex items-center gap-3 px-3 py-1.5 rounded-[4px] text-[12px] text-[#605E5C] hover:bg-[#F3F2F1] hover:text-[#242424]"
        >
          <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
          {!sidebarCollapsed && <span>System Status</span>}
        </NavLink>
      </div>
    </aside>
  );
};
