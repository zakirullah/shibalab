import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user by wallet address
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet')

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Validate BSC address
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid BSC address' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        activePackage: true,
        deposits: { orderBy: { createdAt: 'desc' }, take: 10 },
        withdrawals: { orderBy: { createdAt: 'desc' }, take: 10 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      }
    })

    if (!user) {
      // Create new user
      const referralCode = wallet.slice(2, 10).toLowerCase()
      user = await prisma.user.create({
        data: {
          wallet,
          referralCode,
          balance: 0,
          totalInvested: 0,
          totalEarned: 0,
          referralEarnings: 0,
        },
        include: {
          activePackage: true,
          deposits: true,
          withdrawals: true,
          transactions: true,
        }
      })

      // Update platform stats
      await prisma.platformStats.upsert({
        where: { id: 'stats' },
        update: { totalUsers: { increment: 1 } },
        create: { id: 'stats', totalUsers: 1 }
      })
    }

    // Calculate referral count
    const referralCount = await prisma.user.count({
      where: { referredBy: wallet }
    })

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        referralCount
      }
    })
  } catch (error) {
    console.error('User API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Register with referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, referrer } = body

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Valid BSC wallet address required' }, { status: 400 })
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { wallet } })

    if (user) {
      return NextResponse.json({ success: true, user, isNew: false })
    }

    // Create new user with referral
    const referralCode = wallet.slice(2, 10).toLowerCase()
    user = await prisma.user.create({
      data: {
        wallet,
        referralCode,
        referredBy: referrer || null,
      }
    })

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { id: 'stats' },
      update: { totalUsers: { increment: 1 } },
      create: { id: 'stats', totalUsers: 1 }
    })

    return NextResponse.json({ success: true, user, isNew: true })
  } catch (error) {
    console.error('User Registration Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
