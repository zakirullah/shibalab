import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Health check for database connection
export async function GET() {
  try {
    // Get DATABASE_URL info (without exposing the full URL)
    const dbUrl = process.env.DATABASE_URL || ''
    const urlPreview = dbUrl ? `${dbUrl.substring(0, 15)}...` : 'NOT SET'
    const urlStart = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')

    // Test database connection
    const userCount = await prisma.user.count()
    const depositCount = await prisma.deposit.count()
    const withdrawalCount = await prisma.withdrawal.count()

    return NextResponse.json({
      success: true,
      database: 'connected',
      debug: {
        urlPreview,
        validFormat: urlStart,
        urlLength: dbUrl.length
      },
      tables: {
        users: userCount,
        deposits: depositCount,
        withdrawals: withdrawalCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Health check error:', error)

    const dbUrl = process.env.DATABASE_URL || ''
    const urlPreview = dbUrl ? `${dbUrl.substring(0, 30)}...` : 'NOT SET'

    return NextResponse.json({
      success: false,
      database: 'disconnected',
      error: error.message || 'Unknown error',
      debug: {
        urlPreview,
        urlLength: dbUrl.length,
        startsWithPostgres: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
        hasQuotes: dbUrl.startsWith('"') || dbUrl.startsWith("'")
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
