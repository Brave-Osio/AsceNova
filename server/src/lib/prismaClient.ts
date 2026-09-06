import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient. In serverless (Vercel), each cold start creates
 * a fresh module scope so this still runs once per invocation lifetime;
 * caching on `globalThis` additionally protects local `tsx watch` dev
 * runs from exhausting Supabase's pooled connection limit across reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
