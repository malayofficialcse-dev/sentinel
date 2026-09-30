import { create } from 'zustand';
import { User, UserRole, Permission } from '../types';
import { ROLE_PERMISSIONS } from '../permissions/roles';

if (typeof window !== 'undefined') {
  try {
    const saved = JSON.parse(window.localStorage.getItem('sentinel-role-permissions') || '{}') as Record<string, Permission[]>;
    Object.entries(saved).forEach(([role, permissions]) => {
      if (role in ROLE_PERMISSIONS && Array.isArray(permissions)) {
        ROLE_PERMISSIONS[role as UserRole] = permissions;
      }
    });
  } catch {
    // Ignore malformed local access policies and use the built-in defaults.
  }
}

// System-level user used when auth is bypassed (no real login system active).
// This does NOT represent a real person — it is a neutral placeholder.
const systemUser: User = {
  id: 'SYS-INVESTIGATOR',
  name: 'System User',
  email: 'system@sentinel.local',
  role: UserRole.INVESTIGATOR,
  status: 'active',
  permissions: ROLE_PERMISSIONS[UserRole.INVESTIGATOR],
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
  setRolePermissions: (role: UserRole, permissions: Permission[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Auto-authenticated as a neutral system user (real auth system is not yet active)
  user: systemUser,
  isAuthenticated: true,
  role: UserRole.INVESTIGATOR,
  permissions: systemUser.permissions,

  login: (role = UserRole.INVESTIGATOR) => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    const user = { ...systemUser, role, permissions };
    set({
      user,
      isAuthenticated: true,
      role,
      permissions,
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
    const permissions = ROLE_PERMISSIONS[role] || [];
    const user = { ...systemUser, role, permissions };
    set({
      user,
      role,
      permissions,
      isAuthenticated: true,
    });
  },

  setRolePermissions: (role, permissions) => {
    ROLE_PERMISSIONS[role] = permissions;
    if (typeof window !== 'undefined') {
      const current = JSON.parse(window.localStorage.getItem('sentinel-role-permissions') || '{}');
      window.localStorage.setItem('sentinel-role-permissions', JSON.stringify({ ...current, [role]: permissions }));
    }
    if (get().role === role) {
      set((state) => ({ permissions, user: state.user ? { ...state.user, permissions } : state.user }));
    }
  },

  hasPermission: (permission: Permission) => {
    const { permissions, role } = get();
    if (role === UserRole.ADMIN) return true;
    return permissions.includes(permission);
  },
}));
