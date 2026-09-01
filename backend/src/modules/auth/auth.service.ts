import bcrypt from "bcrypt";
import { Prisma, RoleName, UserStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AuthResponse, AuthTokens, ChangePasswordInput, LoginInput, RefreshTokenInput, RegisterInput } from "./auth.types";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import crypto from "node:crypto";

const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 10);
const sanitizeUser = (user: any) => ({
  id: user.id,
  organizationId: user.organizationId,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt
});

const createTokens = async (user: { id: string; email: string; role: RoleName; organizationId?: string | null; status: UserStatus }, refreshTokenValue?: string): Promise<AuthTokens> => {
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, type: "access" });
  const tokenId = crypto.randomUUID();
  const refreshToken = generateRefreshToken({ userId: user.id, tokenId, type: "refresh" });

  if (refreshTokenValue) {
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() }
    });
  }

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
};

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  const existing = await prisma.user.findFirst({
    where: { email: normalizedEmail, ...(input.organizationId ? { organizationId: input.organizationId } : {}) }
  });

  if (existing) {
    throw Object.assign(new Error("Email already exists."), { statusCode: 409, code: "EMAIL_ALREADY_EXISTS" });
  }

  let organizationId = input.organizationId ?? null;

  if (!organizationId) {
    const currentOrg = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" }
    });
    if (currentOrg) {
      organizationId = currentOrg.id;
    } else {
      const createdOrg = await prisma.organization.create({
        data: { name: process.env.DEFAULT_ORGANIZATION_NAME || "Sentinel Default Org", slug: "sentinel-default-org" }
      });
      organizationId = createdOrg.id;
    }
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      role: input.role ?? RoleName.VIEWER,
      status: UserStatus.ACTIVE,
      organizationId
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "USER_CREATED",
      resource: "user",
      resourceId: user.id,
      metadata: { createdBy: user.id }
    }
  });

  const tokens = await createTokens(user);

  return {
    user: sanitizeUser(user),
    tokens
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase(), organizationId: undefined as any }
  });

  if (!user) {
    throw Object.assign(new Error("Invalid email or password."), { statusCode: 401, code: "INVALID_CREDENTIALS" });
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw Object.assign(new Error("Invalid email or password."), { statusCode: 401, code: "INVALID_CREDENTIALS" });
  }

  if (user.status === UserStatus.INACTIVE || user.status === UserStatus.SUSPENDED) {
    throw Object.assign(new Error("This account is inactive or suspended."), { statusCode: 403, code: "ACCOUNT_INACTIVE" });
  }

  const tokens = await createTokens(user);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  await prisma.auditLog.create({
    data: {
      userId: updatedUser.id,
      action: "LOGIN",
      resource: "auth",
      resourceId: updatedUser.id,
      metadata: { email: updatedUser.email }
    }
  });

  return {
    user: sanitizeUser(updatedUser),
    tokens
  };
}

export async function logoutUser(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { userId: decoded.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "LOGOUT",
      resource: "auth",
      resourceId: userId,
      metadata: { revoked: true }
    }
  });
}

export async function refreshUserToken(input: RefreshTokenInput): Promise<AuthTokens> {
  const decoded = verifyRefreshToken(input.refreshToken);
  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { userId: decoded.userId, revokedAt: null },
    include: { user: true }
  });

  if (!tokenRecord) {
    throw Object.assign(new Error("Refresh token is invalid or expired."), { statusCode: 401, code: "INVALID_REFRESH_TOKEN" });
  }

  const matches = await bcrypt.compare(input.refreshToken, tokenRecord.tokenHash);
  if (!matches) {
    throw Object.assign(new Error("Refresh token is invalid or expired."), { statusCode: 401, code: "INVALID_REFRESH_TOKEN" });
  }

  const user = tokenRecord.user;
  if (user.status === UserStatus.INACTIVE || user.status === UserStatus.SUSPENDED) {
    throw Object.assign(new Error("This account is inactive or suspended."), { statusCode: 403, code: "ACCOUNT_INACTIVE" });
  }

  const nextTokens = await createTokens(user, input.refreshToken);
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "TOKEN_REFRESHED",
      resource: "auth",
      resourceId: user.id,
      metadata: { tokenId: decoded.tokenId }
    }
  });

  return nextTokens;
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("User not found."), { statusCode: 404, code: "USER_NOT_FOUND" });
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Current password is incorrect."), { statusCode: 401, code: "INVALID_CURRENT_PASSWORD" });
  }

  const newHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "PASSWORD_CHANGED",
      resource: "user",
      resourceId: userId,
      metadata: { changedAt: new Date().toISOString() }
    }
  });
}

export async function getUserById(id: string): Promise<any> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true
    }
  });
}

export async function getCurrentUserProfile(userId: string): Promise<any> {
  return getUserById(userId);
}
