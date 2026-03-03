import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Get all stats
    const [
      totalUsers,
      pendingDeposits,
      confirmedDepositsAgg,
      pendingWithdrawals,
      completedWithdrawalsAgg,
      recentDeposits,
      recentWithdrawals,
      recentUsers,
      platformStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.count({ where: { status: 'pending' } }),
      prisma.deposit.aggregate({
        _sum: { amount: true },
        where: { status: 'confirmed' }
      }),
      prisma.withdrawal.count({ where: { status: 'pending' } }),
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      }),
      prisma.deposit.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { wallet: true } } }
      }),
      prisma.withdrawal.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { wallet: true } } }
      }),
      prisma.user.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          wallet: true,
          balance: true,
          totalInvested: true,
          referralEarnings: true,
          createdAt: true,
          activePackage: { select: { packageId: true, investment: true } }
        }
      }),
      prisma.platformStats.findUnique({ where: { id: 'stats' } })
    ])

    // Count users active in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const onlineUsers = await prisma.user.count({
      where: { lastActiveAt: { gte: fiveMinutesAgo } }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        pendingDeposits,
        pendingWithdrawals,
        totalInvested: confirmedDepositsAgg._sum.amount || 0,
        totalWithdrawn: completedWithdrawalsAgg._sum.amount || 0,
        onlineUsers,
        totalVisitors: platformStats?.totalVisitors || 0,
        todayVisitors: platformStats?.todayVisitors || 0
      },
      recent: {
        deposits: recentDeposits.map(d => ({
          id: d.id,
          amount: d.amount,
          packageId: d.packageId,
          transactionHash: d.transactionHash,
          status: d.status,
          wallet: d.user.wallet,
          createdAt: d.createdAt
        })),
        withdrawals: recentWithdrawals.map(w => ({
          id: w.id,
          amount: w.amount,
          walletAddress: w.walletAddress,
          status: w.status,
          userWallet: w.user.wallet,
          createdAt: w.createdAt
        })),
        users: recentUsers
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
