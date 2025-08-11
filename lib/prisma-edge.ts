import { PrismaClient } from '@prisma/client'

// Edge-compatible Prisma instance without extensions
// This is used in middleware and other edge runtime environments
const globalForPrismaEdge = globalThis as unknown as {
  prismaEdge: PrismaClient | undefined
}

export const prismaEdge = globalForPrismaEdge.prismaEdge ?? new PrismaClient({
  log: [],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaEdge.prismaEdge = prismaEdge
}
