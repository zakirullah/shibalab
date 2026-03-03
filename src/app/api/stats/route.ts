import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get platform statistics
export async function GET() {
  try {
    // Get stats from database
    let stats = await prisma.platformStats.findUnique({
      where: { id: 'stats' }
    })

    if (!stats) {
      // Calculate from actual data
      const totalUsers = await prisma.user.count()
      const totalInvestedResult = await prisma.deposit.aggregate({
        _sum: { amount: true },
        where: { status: 'confirmed' }
      })
      const totalWithdrawnResult = await prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })

      stats = await prisma.platformStats.create({
        data: {
          id: 'stats',
          totalUsers,
          totalInvested: totalInvestedResult._sum.amount || 0,
          totalWithdrawn: totalWithdrawnResult._sum.amount || 0,
          onlineUsers: 0
        }
      })
    }

    // Get real counts
    const actualTotalUsers = await prisma.user.count()
    const actualTotalInvested = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { status: 'confirmed' }
    })
    const actualTotalWithdrawn = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    })

    // Simulate online users
    const onlineUsers = 2000 + Math.floor(Math.random() * 1500)

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: actualTotalUsers,
        totalInvested: actualTotalInvested._sum.amount || 0,
        totalWithdrawn: actualTotalWithdrawn._sum.amount || 0,
        onlineUsers
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
        onlineUsers: 2500
      }
    })
  }
}
