import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

function getConnectionString() {
  // Try env vars first (Amplify runtime), fallback to hardcoded for buildpad Supabase
  return (
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    'postgresql://postgres.f19f407b-b0a2-49e5-8a54-95a8b031189f:kyECrb1hvps7-2diT8x6sinL2bFB84Ty@db2.buildpad.ai:5432/postgres'
  );
}

function createPrismaClient() {
  const connectionString = getConnectionString();
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
