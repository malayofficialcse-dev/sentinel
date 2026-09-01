declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: import("@prisma/client").RoleName;
        organizationId?: string | null;
        status: import("@prisma/client").UserStatus;
      };
    }
  }
}

export {};
