import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    const users = await db.getAllUsers(100)
    
    return NextResponse.json({ 
      success: true, 
      users: users.map(u => ({
        wallet_address: u.wallet_address,
        balance: u.balance || 0,
        total_deposited: u.total_deposited || 0,
        total_withdrawn: u.total_withdrawn || 0,
        status: u.status,
        created_at: u.created_at
      }))
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch users',
      users: [] 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, action } = body
    
    if (!wallet || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet and action required' 
      })
    }
    
    const newStatus = action === 'ban' ? 'banned' : 'active'
    
    await db.updateUserStatus(wallet, newStatus)
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${action === 'ban' ? 'banned' : 'activated'} successfully` 
    })
  } catch (error) {
    console.error('Admin user action error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update user status' 
    })
  }
}
