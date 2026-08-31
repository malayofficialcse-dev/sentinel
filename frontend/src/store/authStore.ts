import { create } from 'zustand';
import { User, UserRole, Permission } from '../types';

// System-level user used when auth is bypassed (no real login system active).
// This does NOT represent a real person — it is a neutral placeholder.
const systemUser: User = {
  id: 'SYS-INVESTIGATOR',
  name: 'System User',
  email: 'system@sentinel.local',
  role: UserRole.INVESTIGATOR,
  status: 'active',
  permissions: Object.values(Permission),
  createdAt: new Date().toISOString(),
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  permissions: Permission[];
  login: (role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Auto-authenticated as a neutral system user (real auth system is not yet active)
  user: systemUser,
  isAuthenticated: true,
  role: UserRole.INVESTIGATOR,
  permissions: systemUser.permissions,

  login: (role = UserRole.INVESTIGATOR) => {
    const user = { ...systemUser, role };
    set({
      user,
      isAuthenticated: true,
      role,
      permissions: systemUser.permissions,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      permissions: [],
    });
  },

  switchRole: (role: UserRole) => {
    const user = { ...systemUser, role };
    set({
      user,
      role,
      permissions: systemUser.permissions,
      isAuthenticated: true,
    });
  },

  hasPermission: (permission: Permission) => {
    const { permissions, role } = get();
    if (role === UserRole.ADMIN) return true;
    return permissions.includes(permission);
  },
}));
