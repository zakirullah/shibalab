import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    // Get actual user count from database
    const { count: actualUserCount } = await db.supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // Get actual deposits total
    const { data: depositStats } = await db.supabaseAdmin
      .from('deposits')
      .select('amount')
      .eq('status', 'approved')
    
    const totalDeposits = (depositStats || []).reduce((sum, d) => sum + (d.amount || 0), 0)
    
    // Get actual withdrawals total
    const { data: withdrawalStats } = await db.supabaseAdmin
      .from('withdrawals')
      .select('amount')
      .eq('status', 'sent')
    
    const totalWithdrawals = (withdrawalStats || []).reduce((sum, w) => sum + (w.amount || 0), 0)
    
    // Get platform stats for visitors
    const stats = await db.getPlatformStats()
    
    // Random online variation
    const onlineVariation = Math.floor(Math.random() * 20) + 5
    
    return NextResponse.json({
      success: true,
      totalUsers: actualUserCount || 0,
      online: onlineVariation,
      totalVisitors: stats.total_visitors || 0,
      totalDeposits: totalDeposits,
      totalWithdrawals: totalWithdrawals,
    })
  } catch (error: any) {
    console.error('Stats error:', error)
    
    // Return zero values instead of fake data
    return NextResponse.json({
      success: false,
      totalUsers: 0,
      online: 0,
      totalVisitors: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
    })
  }
}
