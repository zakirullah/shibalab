import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple admin secret (in production, use proper authentication)
const ADMIN_SECRET = 'shibalab_admin_2024_secret'

// Verify admin access
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const urlSecret = request.nextUrl.searchParams.get('secret')
  
  if (authHeader === `Bearer ${ADMIN_SECRET}` || urlSecret === ADMIN_SECRET) {
    return true
  }
  return false
}

// GET - Get all pending deposits for admin
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = request.nextUrl.searchParams.get('status') || 'all'

    const whereClause: any = {}
    if (status !== 'all') {
      whereClause.status = status
    }

    const deposits = await prisma.deposit.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { 
            wallet: true,
            totalInvested: true,
            createdAt: true
          }
        }
      }
    })

    // Get stats
    const stats = await prisma.deposit.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: { status: 'pending' }
    })

    return NextResponse.json({
      success: true,
      deposits: deposits.map(d => ({
        id: d.id,
        userId: d.userId,
        wallet: d.user.wallet,
        amount: d.amount,
        packageId: d.packageId,
        transactionHash: d.transactionHash,
        status: d.status,
        createdAt: d.createdAt,
        userTotalInvested: d.user.totalInvested,
        userJoinedAt: d.user.createdAt
      })),
      stats: {
        pendingCount: stats._count.id || 0,
        pendingAmount: stats._sum.amount || 0
      }
    })
  } catch (error) {
    console.error('Admin Get Deposits Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Approve or Reject deposit
export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { depositId, action } = body // action: 'approve' or 'reject'

    if (!depositId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    if (deposit.status !== 'pending') {
      return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 })
    }

    if (action === 'reject') {
      // Reject deposit
      await prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: 'rejected'
        }
      })

      // Update transaction record
      await prisma.transaction.updateMany({
        where: { 
          userId: deposit.userId,
          type: 'deposit_pending',
          amount: deposit.amount
        },
        data: { status: 'rejected', type: 'deposit_rejected' }
      })

      return NextResponse.json({
        success: true,
        message: 'Deposit rejected',
        depositId
      })
    }

    // Approve deposit
    const packages = [
      { id: 1, name: 'Starter', deposit: 100000, totalReturn: 140000, profit: 40000 },
      { id: 2, name: 'Bronze', deposit: 250000, totalReturn: 350000, profit: 100000 },
      { id: 3, name: 'Silver', deposit: 500000, totalReturn: 700000, profit: 200000 },
      { id: 4, name: 'Gold', deposit: 1000000, totalReturn: 1400000, profit: 400000 },
      { id: 5, name: 'Platinum', deposit: 2500000, totalReturn: 3500000, profit: 1000000 },
      { id: 6, name: 'Diamond', deposit: 5000000, totalReturn: 7000000, profit: 2000000 },
    ]
    const pkg = packages.find(p => p.id === deposit.packageId) || packages[0]

    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Process deposit approval in transaction
    await prisma.$transaction(async (tx) => {
      // Update deposit status
      await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: 'confirmed',
          confirmedAt: now
        }
      })

      // Update user
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          totalInvested: { increment: deposit.amount },
          balance: { increment: deposit.amount }
        }
      })

      // Create or update active package
      await tx.activePackage.upsert({
        where: { userId: deposit.userId },
        update: {
          packageId: deposit.packageId,
          investment: deposit.amount,
          totalReturn: pkg.totalReturn,
          dailyEarning: pkg.profit / 30,
          startDate: now,
          endDate,
          daysRemaining: 30,
          isActive: true
        },
        create: {
          userId: deposit.userId,
          packageId: deposit.packageId,
          investment: deposit.amount,
          totalReturn: pkg.totalReturn,
          dailyEarning: pkg.profit / 30,
          startDate: now,
          endDate,
          daysRemaining: 30,
          isActive: true
        }
      })

      // Update transaction record
      await tx.transaction.updateMany({
        where: { 
          userId: deposit.userId,
          type: 'deposit_pending',
          amount: deposit.amount
        },
        data: { status: 'completed', type: 'deposit' }
      })

      // Update platform stats
      await tx.platformStats.upsert({
        where: { id: 'stats' },
        update: { totalInvested: { increment: deposit.amount } },
        create: { id: 'stats', totalInvested: deposit.amount }
      })

      // Handle referral bonus
      if (deposit.user.referredBy) {
        const referrer = await tx.user.findUnique({
          where: { wallet: deposit.user.referredBy }
        })
        if (referrer) {
          const bonus = deposit.amount * 0.05
          await tx.user.update({
            where: { id: referrer.id },
            data: {
              referralEarnings: { increment: bonus },
              balance: { increment: bonus }
            }
          })
          await tx.transaction.create({
            data: {
              userId: referrer.id,
              type: 'referral',
              amount: bonus,
              status: 'completed'
            }
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Deposit approved! Mining has started.',
      depositId,
      amount: deposit.amount,
      packageId: deposit.packageId
    })
  } catch (error) {
    console.error('Admin Approve Deposit Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
