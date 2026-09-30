import React from 'react';
import { Permission } from '../types';
import { useAuthStore } from '../store/authStore';

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
  const allowed = useAuthStore((state) => state.hasPermission(permission));
  return allowed ? <>{children}</> : <>{fallback}</>;
};
