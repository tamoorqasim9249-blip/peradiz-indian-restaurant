import { PrismaClient } from "@prisma/client";

// Standard Next.js serverless-safe Prisma singleton — avoids exhausting DB connections from
// hot-reloading in dev / multiple lambda invocations. See CLAUDE.md §8.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
