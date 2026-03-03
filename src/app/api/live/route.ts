import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get live transactions (only confirmed deposits and completed withdrawals)
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    // Get recent CONFIRMED deposits only
    const deposits = await prisma.deposit.findMany({
      where: { status: 'confirmed' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { wallet: true }
        }
      }
    })

    // Get recent COMPLETED withdrawals only
    const withdrawals = await prisma.withdrawal.findMany({
      where: { status: 'completed' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { wallet: true }
        }
      }
    })

    // Format transactions
    const formattedDeposits = deposits.map(d => ({
      id: d.id,
      type: 'deposit',
      amount: d.amount,
      wallet: d.user.wallet,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      displayWallet: `${d.user.wallet.slice(0, 6)}...${d.user.wallet.slice(-4)}`
    }))

    const formattedWithdrawals = withdrawals.map(w => ({
      id: w.id,
      type: 'withdraw',
      amount: w.amount,
      wallet: w.walletAddress,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      displayWallet: `${w.walletAddress.slice(0, 6)}...${w.walletAddress.slice(-4)}`
    }))

    // Combine and sort by date
    const allTransactions = [...formattedDeposits, ...formattedWithdrawals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      transactions: allTransactions,
      depositsCount: deposits.length,
      withdrawalsCount: withdrawals.length
    })
  } catch (error) {
    console.error('Live transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
