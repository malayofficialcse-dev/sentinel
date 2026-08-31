import { create } from 'zustand';
import { Notification } from '../types';

interface UIState {
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  globalSearchQuery: string;
  isGlobalSearchOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (n: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setGlobalSearchQuery: (query: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  // Notifications start empty — real notifications come from backend events
  notifications: [],
  unreadNotificationCount: 0,
  globalSearchQuery: '',
  isGlobalSearchOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  addNotification: (n: Notification) =>
    set((state) => {
      const updated = [n, ...state.notifications];
      return {
        notifications: updated,
        unreadNotificationCount: updated.filter((x) => !x.read).length,
      };
    }),

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
