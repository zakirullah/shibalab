import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Clean and validate DATABASE_URL
function getDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL || ''

  // Remove quotes if present
  dbUrl = dbUrl.replace(/^["']|["']$/g, '')

  // Trim whitespace
  dbUrl = dbUrl.trim()

  // Validate format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('Invalid DATABASE_URL format. Must start with postgresql:// or postgres://')
    console.error('Current URL starts with:', dbUrl.substring(0, 30) + '...')
  }

  return dbUrl
}

const databaseUrl = getDatabaseUrl()

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasourceUrl: databaseUrl || undefined,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
