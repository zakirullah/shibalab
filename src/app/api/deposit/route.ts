import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all deposits (for live feed)
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const status = request.nextUrl.searchParams.get('status') // pending, confirmed, rejected

    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }

    const deposits = await prisma.deposit.findMany({
      where: whereClause,
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
        transactionHash: d.transactionHash,
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

// POST - Create new deposit (PENDING - requires admin approval)
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

    // Create deposit as PENDING - requires admin approval
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        amount: depositAmount,
        transactionHash,
        packageId,
        status: 'pending' // PENDING - will be confirmed by admin
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'deposit_pending',
        amount: depositAmount,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted! Waiting for admin confirmation. Mining will start after verification.',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        status: deposit.status,
        packageId: deposit.packageId
      }
    })
  } catch (error) {
    console.error('Deposit Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
