import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get live transactions
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30')
    const type = request.nextUrl.searchParams.get('type')

    const whereClause: { type?: string } = {}
    if (type && (type === 'deposit' || type === 'withdraw')) {
      whereClause.type = type
    }

    const transactions = await prisma.transaction.findMany({
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
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        wallet: t.user.wallet,
        createdAt: t.createdAt
      }))
    })
  } catch (error) {
    console.error('Transactions API Error:', error)
    return NextResponse.json({ 
      success: true,
      transactions: []
    })
  }
}
