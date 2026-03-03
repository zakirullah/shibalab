import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all withdrawals (for live feed)
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const withdrawals = await prisma.withdrawal.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { wallet: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: w.amount,
        walletAddress: w.walletAddress,
        status: w.status,
        userWallet: w.user.wallet,
        createdAt: w.createdAt
      }))
    })
  } catch (error) {
    console.error('Get Withdrawals Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create withdrawal request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, destinationWallet } = body

    // Validation
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Valid BSC wallet address required' }, { status: 400 })
    }

    if (!amount || parseFloat(amount) < 50000) {
      return NextResponse.json({ error: 'Minimum withdrawal is 50,000 SHIB' }, { status: 400 })
    }

    const destWallet = destinationWallet || wallet
    if (!/^0x[a-fA-F0-9]{40}$/.test(destWallet)) {
      return NextResponse.json({ error: 'Valid destination wallet required' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { wallet } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const withdrawAmount = parseFloat(amount)

    // Check balance
    if (user.balance < withdrawAmount) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        available: user.balance 
      }, { status: 400 })
    }

    // Create withdrawal and update balance in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create withdrawal
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount: withdrawAmount,
          walletAddress: destWallet,
          status: 'pending'
        }
      })

      // Deduct from balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: withdrawAmount } }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'withdraw',
          amount: withdrawAmount,
          status: 'pending'
        }
      })

      // Auto-process withdrawal (for demo)
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'completed',
          processedAt: new Date()
        }
      })

      // Update transaction status
      await tx.transaction.updateMany({
        where: { 
          userId: user.id, 
          type: 'withdraw',
          status: 'pending' 
        },
        data: { status: 'completed' }
      })

      // Update platform stats
      await tx.platformStats.upsert({
        where: { id: 'stats' },
        update: { totalWithdrawn: { increment: withdrawAmount } },
        create: { id: 'stats', totalWithdrawn: withdrawAmount }
      })

      return withdrawal
    })

    return NextResponse.json({
      success: true,
      message: 'Withdrawal processed! You will receive SHIB within 24 hours.',
      withdrawal: result
    })
  } catch (error) {
    console.error('Withdrawal Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
