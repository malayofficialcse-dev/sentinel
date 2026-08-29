import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { UserRole } from '../../types';

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
    <header className="bg-white border-b border-[#E1DFDD] h-16 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#8A8886] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases, entities, IP addresses, UPI IDs..."
            className="w-full h-8 pl-9 pr-4 text-[13px] bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] text-[#242424] placeholder-[#8A8886] focus:outline-none focus:border-[#0078D4] focus:bg-white focus:ring-1 focus:ring-[#0078D4] transition-colors"
          />
        </div>
      </form>

      {/* Action Icons & Profile */}
      <div className="flex items-center gap-1.5">
        {/* Role Switcher for live testing / demo */}
        <div className="mr-2 hidden md:flex items-center gap-1.5 bg-[#F3F2F1] px-2 py-1 rounded-[4px] border border-[#E1DFDD]">
          <span className="text-[11px] text-[#605E5C] font-semibold">Demo Role:</span>
          <select
            value={role || UserRole.INVESTIGATOR}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="text-[11px] font-bold bg-transparent text-[#0078D4] cursor-pointer focus:outline-none"
          >
            <option value={UserRole.INVESTIGATOR}>Investigator</option>
            <option value={UserRole.ANALYST}>Analyst</option>
            <option value={UserRole.REVIEWER}>Reviewer</option>
            <option value={UserRole.AUDITOR}>Auditor</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-[#605E5C] hover:text-[#242424] hover:bg-[#F3F2F1] rounded-[4px] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D13438] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#C8C6C4] rounded-[4px] shadow-lg py-2 z-50">
              <div className="px-3 py-1.5 border-b border-[#E1DFDD] flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#242424]">Notifications</span>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#0078D4] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E1DFDD]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-[#8A8886]">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-left hover:bg-[#F3F2F1] cursor-pointer transition-colors ${
                        !n.read ? 'bg-[#EFF6FC]' : ''
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
                              ? 'bg-[#D13438]'
                              : n.type === 'warning'
                                ? 'bg-[#CA5010]'
                                : 'bg-[#0078D4]'
                          }`}
                        />
                        <span className="text-[12px] font-semibold text-[#242424] truncate">
                          {n.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#605E5C] mt-0.5 line-clamp-2">{n.message}</p>
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
          className="p-1.5 text-[#605E5C] hover:text-[#242424] hover:bg-[#F3F2F1] rounded-[4px] transition-colors cursor-pointer"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        <div className="h-5 w-px bg-[#E1DFDD] mx-1" />

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-[4px] hover:bg-[#F3F2F1] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-[4px] bg-[#E1DFDD] overflow-hidden border border-[#C8C6C4]">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-[#605E5C] flex items-center justify-center h-full">
                  person
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[12px] font-semibold text-[#242424] leading-tight">{user?.name}</span>
              <span className="text-[10px] text-[#605E5C] leading-tight">{role}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#C8C6C4] rounded-[4px] shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#E1DFDD]">
                <p className="text-[13px] font-semibold text-[#242424]">{user?.name}</p>
                <p className="text-[11px] text-[#605E5C] truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/reporter');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-[12px] text-[#242424] hover:bg-[#F3F2F1] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-[#605E5C]">switch_account</span>
                Switch to Reporter Portal
              </button>
              <div className="my-1 border-t border-[#E1DFDD]" />
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-[12px] text-[#D13438] hover:bg-[#FDE7E9] flex items-center gap-2"
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
