import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all users with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}
    
    if (search) {
      whereClause.wallet = { contains: search, mode: 'insensitive' }
    }
    
    if (status === 'active') {
      whereClause.isActive = true
    } else if (status === 'inactive') {
      whereClause.isActive = false
    } else if (status === 'invested') {
      whereClause.totalInvested = { gt: 0 }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          activePackage: true,
          _count: {
            select: { deposits: true, withdrawals: true }
          }
        }
      }),
      prisma.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        wallet: u.wallet,
        balance: u.balance,
        totalInvested: u.totalInvested,
        totalEarned: u.totalEarned,
        referralEarnings: u.referralEarnings,
        referralCode: u.referralCode,
        referredBy: u.referredBy,
        isActive: u.isActive,
        lastActiveAt: u.lastActiveAt,
        createdAt: u.createdAt,
        activePackage: u.activePackage,
        depositsCount: u._count.deposits,
        withdrawalsCount: u._count.withdrawals
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, amount } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'activate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        })
        break

      case 'addBalance':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
        }
        await prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } }
        })
        await prisma.transaction.create({
          data: {
            userId,
            type: 'admin_bonus',
            amount,
            status: 'completed'
          }
        })
        break

      case 'deductBalance':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
        }
        await prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} successful`
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Delete user (cascades to related records)
    await prisma.user.delete({ where: { id: userId } })

    // Update platform stats
    await prisma.platformStats.update({
      where: { id: 'stats' },
      data: { totalUsers: { decrement: 1 } }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
