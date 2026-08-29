import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { UserRole } from '../../types';
import { ThemeToggle } from '../ui/ThemeToggle';

export const TopNav: React.FC = () => {
  const { user, role, switchRole, logout } = useAuthStore();
  const { notifications, unreadNotificationCount, markAllNotificationsAsRead } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/investigator/cases?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--border)] h-16 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0 transition-colors">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[var(--text-muted)] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases, entities, IP addresses, UPI IDs..."
            className="w-full h-8 pl-9 pr-4 text-[13px] bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
          />
        </div>
      </form>

      {/* Action Icons & Profile */}
      <div className="flex items-center gap-2">
        {/* Role Switcher for live testing / demo */}
        <div className="mr-1 hidden md:flex items-center gap-1.5 bg-[var(--surface-secondary)] px-2 py-1 rounded-[4px] border border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-secondary)] font-semibold">Demo Role:</span>
          <select
            value={role || UserRole.INVESTIGATOR}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="text-[11px] font-bold bg-transparent text-[var(--primary)] cursor-pointer focus:outline-none"
          >
            <option value={UserRole.INVESTIGATOR} className="bg-[var(--surface)] text-[var(--text-primary)]">Investigator</option>
            <option value={UserRole.ANALYST} className="bg-[var(--surface)] text-[var(--text-primary)]">Analyst</option>
            <option value={UserRole.REVIEWER} className="bg-[var(--surface)] text-[var(--text-primary)]">Reviewer</option>
            <option value={UserRole.AUDITOR} className="bg-[var(--surface)] text-[var(--text-primary)]">Auditor</option>
            <option value={UserRole.ADMIN} className="bg-[var(--surface)] text-[var(--text-primary)]">Admin</option>
          </select>
        </div>

        {/* Day / Night Mode Toggle */}
        <ThemeToggle />

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[4px] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--danger)] rounded-full ring-2 ring-[var(--surface)]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[4px] shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[var(--text-primary)]">Notifications</span>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-left hover:bg-[var(--surface-hover)] cursor-pointer transition-colors ${
                        !n.read ? 'bg-[var(--info-bg)]' : ''
                      }`}
                      onClick={() => {
                        if (n.actionUrl) navigate(n.actionUrl);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            n.type === 'danger'
                              ? 'bg-[var(--danger)]'
                              : n.type === 'warning'
                                ? 'bg-[var(--warning)]'
                                : 'bg-[var(--primary)]'
                          }`}
                        />
                        <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate">
                          {n.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => navigate('/admin/settings')}
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[4px] transition-colors cursor-pointer"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        <div className="h-5 w-px bg-[var(--border)] mx-1" />

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-[4px] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[var(--surface-secondary)] overflow-hidden border border-[var(--border-strong)]">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-[var(--text-secondary)] flex items-center justify-center h-full">
                  person
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight">{user?.name}</span>
              <span className="text-[10px] text-[var(--text-secondary)] leading-tight">{role}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[4px] shadow-xl py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/reporter');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[var(--text-secondary)]">switch_account</span>
                Switch to Reporter Portal
              </button>
              <div className="my-1 border-t border-[var(--border)]" />
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-[12px] text-[var(--danger)] hover:bg-[var(--danger-bg)] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
