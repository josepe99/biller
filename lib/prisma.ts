import { PrismaClient } from "@prisma/client";


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized Prisma client configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Logging for development
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // Performance optimizations
    errorFormat: "minimal",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown - only in Node.js runtime, not in Edge Runtime
if (typeof process !== 'undefined' && process.on) {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
