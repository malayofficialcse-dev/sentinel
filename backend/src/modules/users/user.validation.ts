import { z } from "zod";
import { RoleName } from "@prisma/client";

export const updateSelfSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional()
});

export const updateUserByAdminSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(RoleName).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional()
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(RoleName).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  search: z.string().optional()
});
