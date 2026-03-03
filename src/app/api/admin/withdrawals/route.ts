import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all withdrawals for admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause: any = {}
    if (status !== 'all') {
      whereClause.status = status
    }

    const skip = (page - 1) * limit

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { wallet: true, balance: true } }
        }
      }),
      prisma.withdrawal.count({ where: whereClause })
    ])

    // Get pending stats
    const pendingStats = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: 'pending' }
    })

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        userId: w.userId,
        amount: w.amount,
        walletAddress: w.walletAddress,
        status: w.status,
        processedAt: w.processedAt,
        createdAt: w.createdAt,
        user: {
          wallet: w.user.wallet,
          balance: w.user.balance
        }
      })),
      stats: {
        pendingCount: pendingStats._count.id || 0,
        pendingAmount: pendingStats._sum.amount || 0
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Approve or Reject withdrawal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { withdrawalId, action, txHash } = body // action: 'approve' or 'reject'

    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Withdrawal ID and valid action required' }, { status: 400 })
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    })

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 })
    }

    if (action === 'reject') {
      // Reject - refund balance to user
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'rejected',
            processedAt: new Date()
          }
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } }
        }),
        prisma.transaction.create({
          data: {
            userId: withdrawal.userId,
            type: 'withdrawal_rejected',
            amount: withdrawal.amount,
            status: 'completed'
          }
        })
      ])

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected, balance refunded'
      })
    }

    // Approve withdrawal
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'completed',
          processedAt: new Date()
        }
      }),
      prisma.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: 'completed'
        }
      }),
      prisma.platformStats.upsert({
        where: { id: 'stats' },
        update: { totalWithdrawn: { increment: withdrawal.amount } },
        create: { id: 'stats', totalWithdrawn: withdrawal.amount }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Withdrawal approved successfully'
    })
  } catch (error) {
    console.error('Process withdrawal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
