import { create } from 'zustand';
import { User, UserRole, Permission } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  permissions: Permission[];
  login: (role?: UserRole, userIndex?: number) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Default to Investigator (Rahul Sharma) for rich initial demo experience
  user: mockUsers[0],
  isAuthenticated: true,
  role: UserRole.INVESTIGATOR,
  permissions: mockUsers[0].permissions,

  login: (role = UserRole.INVESTIGATOR, userIndex = 0) => {
    const selectedUser = mockUsers.find((u) => u.role === role) || mockUsers[userIndex] || mockUsers[0];
    set({
      user: selectedUser,
      isAuthenticated: true,
      role: selectedUser.role,
      permissions: selectedUser.permissions,
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
    const userWithRole = mockUsers.find((u) => u.role === role) || {
      ...mockUsers[0],
      role,
      permissions: role === UserRole.ADMIN ? Object.values(Permission) : mockUsers[0].permissions,
    };
    set({
      user: userWithRole,
      role: userWithRole.role,
      permissions: userWithRole.permissions,
      isAuthenticated: true,
    });
  },

  hasPermission: (permission: Permission) => {
    const { permissions, role } = get();
    if (role === UserRole.ADMIN) return true;
    return permissions.includes(permission);
  },
}));
