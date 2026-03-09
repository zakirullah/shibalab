import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    // Get real users from database, ordered by total_deposited
    const { data: users, error } = await db.supabaseAdmin
      .from('users')
      .select('wallet_address, total_deposited, total_earned, created_at')
      .gt('total_deposited', 0)
      .order('total_deposited', { ascending: false })
      .limit(30)
    
    if (error) {
      console.error('Leaderboard error:', error)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch leaderboard',
        users: [] 
      })
    }
    
    const leaderboardUsers = (users || []).map((user, index) => ({
      rank: index + 1,
      wallet: user.wallet_address,
      total_deposited: user.total_deposited || 0,
      total_earned: user.total_earned || 0,
      created_at: user.created_at
    }))
    
    return NextResponse.json({ 
      success: true, 
      users: leaderboardUsers 
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      users: [] 
    })
  }
}
