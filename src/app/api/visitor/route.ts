import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Track visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, ipAddress, userAgent, country } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Check if visitor exists
    const existingVisitor = await prisma.visitor.findUnique({
      where: { sessionId }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (existingVisitor) {
      // Update existing visitor
      await prisma.visitor.update({
        where: { sessionId },
        data: {
          lastVisit: new Date(),
          visitCount: { increment: 1 },
          ipAddress: ipAddress || existingVisitor.ipAddress,
          userAgent: userAgent || existingVisitor.userAgent,
          country: country || existingVisitor.country,
        }
      })

      return NextResponse.json({ success: true, isNew: false })
    }

    // Create new visitor
    await prisma.visitor.create({
      data: {
        sessionId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        country: country || null,
      }
    })

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { id: 'stats' },
      update: {
        totalVisitors: { increment: 1 },
        todayVisitors: { increment: 1 }
      },
      create: {
        id: 'stats',
        totalVisitors: 1,
        todayVisitors: 1
      }
    })

    return NextResponse.json({ success: true, isNew: true })
  } catch (error) {
    console.error('Visitor tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get visitor stats
export async function GET() {
  try {
    const stats = await prisma.platformStats.findUnique({
      where: { id: 'stats' }
    })

    // Count users active in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const onlineUsers = await prisma.user.count({
      where: {
        lastActiveAt: { gte: fiveMinutesAgo }
      }
    })

    // Reset todayVisitors if it's a new day
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return NextResponse.json({
      success: true,
      totalVisitors: stats?.totalVisitors || 0,
      todayVisitors: stats?.todayVisitors || 0,
      onlineUsers
    })
  } catch (error) {
    console.error('Get visitor stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
