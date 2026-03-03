import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get platform statistics
export async function GET() {
  try {
    // Count users active in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const onlineUsers = await prisma.user.count({
      where: {
        lastActiveAt: { gte: fiveMinutesAgo }
      }
    })

    // Get real counts from database
    const totalUsers = await prisma.user.count()

    const totalInvestedResult = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { status: 'confirmed' }
    })

    const totalWithdrawnResult = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    })

    // Get visitor stats
    const platformStats = await prisma.platformStats.findUnique({
      where: { id: 'stats' }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalInvested: totalInvestedResult._sum.amount || 0,
        totalWithdrawn: totalWithdrawnResult._sum.amount || 0,
        onlineUsers,
        totalVisitors: platformStats?.totalVisitors || 0,
        todayVisitors: platformStats?.todayVisitors || 0
      }
    })
  } catch (error) {
    console.error('Stats API Error:', error)
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: 0,
        totalInvested: 0,
        totalWithdrawn: 0,
        onlineUsers: 0,
        totalVisitors: 0,
        todayVisitors: 0
      }
    })
  }
}
