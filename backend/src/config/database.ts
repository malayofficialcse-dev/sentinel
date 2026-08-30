import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"]
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log("✅ PostgreSQL connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}