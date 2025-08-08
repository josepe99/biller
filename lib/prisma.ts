import { PrismaClient } from '@prisma/client'
import { softDeleteExtension } from './soft-delete'

// Server-side Prisma instance with extensions
// This should NOT be imported by middleware or edge runtime code
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})

// Extend with soft delete functionality for server-side use
export const prisma = basePrisma.$extends(softDeleteExtension)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma

export default prisma
