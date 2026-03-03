import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all deposits (for live feed)
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const deposits = await prisma.deposit.findMany({
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
      deposits: deposits.map(d => ({
        id: d.id,
        amount: d.amount,
        packageId: d.packageId,
        status: d.status,
        wallet: d.user.wallet,
        createdAt: d.createdAt
      }))
    })
  } catch (error) {
    console.error('Get Deposits Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new deposit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, transactionHash, packageId } = body

    // Validation
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Valid BSC wallet address required' }, { status: 400 })
    }

    if (!amount || parseFloat(amount) < 100000) {
      return NextResponse.json({ error: 'Minimum deposit is 100,000 SHIB' }, { status: 400 })
    }

    if (!transactionHash || transactionHash.length < 10) {
      return NextResponse.json({ error: 'Valid transaction hash required' }, { status: 400 })
    }

    if (!packageId || packageId < 1 || packageId > 6) {
      return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 })
    }

    // Check for duplicate transaction hash
    const existingDeposit = await prisma.deposit.findUnique({
      where: { transactionHash }
    })

    if (existingDeposit) {
      return NextResponse.json({ error: 'Transaction already submitted' }, { status: 400 })
    }

    // Get user
    let user = await prisma.user.findUnique({ where: { wallet } })
    if (!user) {
      const referralCode = wallet.slice(2, 10).toLowerCase()
      user = await prisma.user.create({
        data: { wallet, referralCode }
      })
    }

    const depositAmount = parseFloat(amount)
    const packages = [
      { id: 1, name: 'Starter', deposit: 100000, totalReturn: 140000, profit: 40000 },
      { id: 2, name: 'Bronze', deposit: 250000, totalReturn: 350000, profit: 100000 },
      { id: 3, name: 'Silver', deposit: 500000, totalReturn: 700000, profit: 200000 },
      { id: 4, name: 'Gold', deposit: 1000000, totalReturn: 1400000, profit: 400000 },
      { id: 5, name: 'Platinum', deposit: 2500000, totalReturn: 3500000, profit: 1000000 },
      { id: 6, name: 'Diamond', deposit: 5000000, totalReturn: 7000000, profit: 2000000 },
    ]
    const pkg = packages.find(p => p.id === packageId) || packages[0]

    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Create deposit in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit
      const deposit = await tx.deposit.create({
        data: {
          userId: user!.id,
          amount: depositAmount,
          transactionHash,
          packageId,
          status: 'confirmed',
          confirmedAt: now
        }
      })

      // Update user
      await tx.user.update({
        where: { id: user!.id },
        data: {
          totalInvested: { increment: depositAmount },
          balance: { increment: depositAmount }
        }
      })

      // Create or update active package
      await tx.activePackage.upsert({
        where: { userId: user!.id },
        update: {
          packageId,
          investment: depositAmount,
          totalReturn: pkg.totalReturn,
          dailyEarning: pkg.profit / 30,
          startDate: now,
          endDate,
          daysRemaining: 30,
          isActive: true
        },
        create: {
          userId: user!.id,
          packageId,
          investment: depositAmount,
          totalReturn: pkg.totalReturn,
          dailyEarning: pkg.profit / 30,
          startDate: now,
          endDate,
          daysRemaining: 30
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user!.id,
          type: 'deposit',
          amount: depositAmount,
          status: 'completed'
        }
      })

      // Update platform stats
      await tx.platformStats.upsert({
        where: { id: 'stats' },
        update: { totalInvested: { increment: depositAmount } },
        create: { id: 'stats', totalInvested: depositAmount }
      })

      // Handle referral bonus
      if (user!.referredBy) {
        const referrer = await tx.user.findUnique({
          where: { wallet: user!.referredBy }
        })
        if (referrer) {
          const bonus = depositAmount * 0.05
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

      return deposit
    })

    return NextResponse.json({
      success: true,
      message: 'Deposit confirmed! Mining has started.',
      deposit: result
    })
  } catch (error) {
    console.error('Deposit Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
