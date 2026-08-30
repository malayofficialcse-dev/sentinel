import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 12);
  await prisma.user.upsert({ where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@sentinel.local' }, update: {}, create: { email: process.env.SEED_ADMIN_EMAIL || 'admin@sentinel.local', name: 'System Administrator', passwordHash, role: RoleName.ADMIN } });
}
main().finally(() => prisma.$disconnect());
