import { PrismaClient } from '@prisma/client'
import { softDeleteExtension } from './soft-delete'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const basePrisma = new PrismaClient({
  log: ['query'],
})

export const prisma = basePrisma.$extends(softDeleteExtension)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
