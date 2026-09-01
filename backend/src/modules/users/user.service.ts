import bcrypt from "bcrypt";
import { Prisma, RoleName, UserStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { Permission } from "../../config/permissions";
import { AppError } from "../../middleware/error.middleware";

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

export async function getUserByIdForAuth(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true
    }
  });
}

export async function getCurrentUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found.");
  }

  return user;
}

export async function getUserById(currentUserId: string, requestedId: string) {
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!currentUser) throw new AppError(401, "UNAUTHORIZED", "Authentication required.");

  const targetUser = await prisma.user.findUnique({ where: { id: requestedId } });
  if (!targetUser) throw new AppError(404, "USER_NOT_FOUND", "User not found.");

  const isSelf = currentUser.id === targetUser.id;
  const sameOrg = currentUser.organizationId && currentUser.organizationId === targetUser.organizationId;

  if (isSelf) return sanitizeUser(targetUser);
  if (currentUser.role === RoleName.SUPER_ADMIN) return sanitizeUser(targetUser);
  if (sameOrg && [RoleName.HEAD, RoleName.INVESTIGATOR, RoleName.ANALYST, RoleName.REPORTER].includes(currentUser.role)) return sanitizeUser(targetUser);

  throw new AppError(403, "FORBIDDEN", "You do not have permission to access this user.");
}

export async function listUsers(currentUserId: string, options: { page: number; limit: number; role?: RoleName; status?: UserStatus; search?: string }) {
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!currentUser) throw new AppError(401, "UNAUTHORIZED", "Authentication required.");

  const isSuperAdmin = currentUser.role === RoleName.SUPER_ADMIN;
  const isHead = currentUser.role === RoleName.HEAD;

  if (!isSuperAdmin && !isHead && currentUser.role !== RoleName.INVESTIGATOR && currentUser.role !== RoleName.ANALYST) {
    throw new AppError(403, "FORBIDDEN", "You do not have permission to list users.");
  }

  const where: Prisma.UserWhereInput = {
    ...(isSuperAdmin ? {} : { organizationId: currentUser.organizationId ?? null }),
    ...(options.role ? { role: options.role } : {}),
    ...(options.status ? { status: options.status } : {}),
    ...(options.search ? {
      OR: [
        { name: { contains: options.search, mode: "insensitive" } },
        { email: { contains: options.search, mode: "insensitive" } }
      ]
    } : {})
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
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
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users.map(sanitizeUser),
    meta: { page: options.page, limit: options.limit, total, totalPages: Math.ceil(total / options.limit) }
  };
}

export async function updateOwnProfile(currentUserId: string, input: { name?: string; email?: string }) {
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found.");

  const existing = input.email && input.email !== user.email
    ? await prisma.user.findFirst({ where: { email: input.email.trim().toLowerCase(), organizationId: user.organizationId ?? null } })
    : null;

  if (existing) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email already exists in this organization.");
  }

  const updated = await prisma.user.update({
    where: { id: currentUserId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email.trim().toLowerCase() } : {})
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUserId,
      action: "USER_UPDATED",
      resource: "user",
      resourceId: currentUserId,
      metadata: { updatedFields: Object.keys(input) }
    }
  });

  return sanitizeUser(updated);
}

export async function updateUserByAdmin(currentUserId: string, targetUserId: string, input: { name?: string; email?: string; role?: RoleName; status?: UserStatus }) {
  const actor = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!actor) throw new AppError(401, "UNAUTHORIZED", "Authentication required.");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError(404, "USER_NOT_FOUND", "User not found.");

  if (actor.role !== RoleName.SUPER_ADMIN && actor.role !== RoleName.HEAD && actor.organizationId !== target.organizationId) {
    throw new AppError(403, "FORBIDDEN", "You cannot modify users outside your organization.");
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email.trim().toLowerCase() } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.status ? { status: input.status } : {})
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUserId,
      action: "USER_UPDATED",
      resource: "user",
      resourceId: targetUserId,
      metadata: { updatedFields: Object.keys(input) }
    }
  });

  return sanitizeUser(updated);
}

export async function deactivateUser(currentUserId: string, targetUserId: string) {
  const actor = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!actor) throw new AppError(401, "UNAUTHORIZED", "Authentication required.");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError(404, "USER_NOT_FOUND", "User not found.");

  if (actor.role !== RoleName.SUPER_ADMIN && actor.role !== RoleName.HEAD && actor.organizationId !== target.organizationId) {
    throw new AppError(403, "FORBIDDEN", "You cannot deactivate users outside your organization.");
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: UserStatus.INACTIVE }
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUserId,
      action: "USER_DEACTIVATED",
      resource: "user",
      resourceId: targetUserId,
      metadata: { status: "INACTIVE" }
    }
  });

  return sanitizeUser(updated);
}

export async function deleteUser(currentUserId: string, targetUserId: string) {
  const actor = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!actor) throw new AppError(401, "UNAUTHORIZED", "Authentication required.");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError(404, "USER_NOT_FOUND", "User not found.");

  if (actor.role !== RoleName.SUPER_ADMIN && actor.role !== RoleName.HEAD && actor.organizationId !== target.organizationId) {
    throw new AppError(403, "FORBIDDEN", "You cannot delete users outside your organization.");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { status: UserStatus.INACTIVE }
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUserId,
      action: "USER_DELETED",
      resource: "user",
      resourceId: targetUserId,
      metadata: { softDelete: true }
    }
  });

  return { success: true };
}
