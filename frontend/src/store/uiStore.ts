import { create } from 'zustand';
import { Notification } from '../types';
import { mockNotifications } from '../data/mockData';

interface UIState {
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  globalSearchQuery: string;
  isGlobalSearchOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setGlobalSearchQuery: (query: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  notifications: mockNotifications,
  unreadNotificationCount: mockNotifications.filter((n) => !n.read).length,
  globalSearchQuery: '',
  isGlobalSearchOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  markNotificationAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadNotificationCount: updated.filter((n) => !n.read).length,
      };
    }),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    })),

  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
}));
