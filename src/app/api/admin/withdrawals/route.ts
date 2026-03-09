import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    
    let withdrawals
    if (status === 'all') {
      withdrawals = await db.getAllWithdrawals(100)
    } else {
      withdrawals = await db.getPendingWithdrawals()
    }

    return NextResponse.json({ 
      success: true, 
      withdrawals 
    })

  } catch (error: any) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { withdrawalId, txHash, action } = body

    if (!withdrawalId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Withdrawal ID is required' 
      }, { status: 400 })
    }

    if (action === 'process' && txHash) {
      await db.processWithdrawal(withdrawalId, txHash)
      return NextResponse.json({ 
        success: true, 
        message: 'Withdrawal processed successfully!' 
      })
    } else if (action === 'reject') {
      // Update withdrawal status to rejected
      await db.supabaseAdmin
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawalId)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Withdrawal rejected' 
      })
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action or missing transaction hash' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('Admin withdrawal error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 })
  }
}
