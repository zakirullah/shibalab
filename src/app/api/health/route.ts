import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Health check for database connection
export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const depositCount = await prisma.deposit.count()
    const withdrawalCount = await prisma.withdrawal.count()

    return NextResponse.json({
      success: true,
      database: 'connected',
      tables: {
        users: userCount,
        deposits: depositCount,
        withdrawals: withdrawalCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json({
      success: false,
      database: 'disconnected',
      error: error.message || 'Unknown error',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
