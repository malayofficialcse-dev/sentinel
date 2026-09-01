import { RoleName, UserStatus } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleName;
  organizationId?: string | null;
  status: UserStatus;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: RoleName;
  organizationId?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: RoleName;
    status: UserStatus;
    organizationId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date | null;
  };
  tokens: AuthTokens;
}
