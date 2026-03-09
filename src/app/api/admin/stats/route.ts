import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get counts
    const [usersResult, depositsResult, withdrawalsResult, pendingDepositsResult, pendingWithdrawalsResult] = await Promise.all([
      db.supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      db.supabaseAdmin.from('deposits').select('amount', { count: 'exact' }).eq('status', 'confirmed'),
      db.supabaseAdmin.from('withdrawals').select('amount', { count: 'exact' }).eq('status', 'completed'),
      db.supabaseAdmin.from('deposits').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.supabaseAdmin.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    const totalUsers = usersResult.count || 0
    const totalDeposits = depositsResult.data?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0
    const totalWithdrawals = withdrawalsResult.data?.reduce((sum: number, w: any) => sum + (w.amount || 0), 0) || 0
    const pendingDeposits = pendingDepositsResult.count || 0
    const pendingWithdrawals = pendingWithdrawalsResult.count || 0

    // Get active investments
    const { data: activeUsers } = await db.supabaseAdmin
      .from('users')
      .select('active_investment, daily_profit, total_earned')
      .gt('active_investment', 0)

    const activeInvestments = activeUsers?.length || 0
    const totalActiveAmount = activeUsers?.reduce((sum: number, u: any) => sum + (u.active_investment || 0), 0) || 0
    const totalProfitDistributed = activeUsers?.reduce((sum: number, u: any) => sum + (u.total_earned || 0), 0) || 0

    // Get package distribution from deposits
    const { data: packageData } = await db.supabaseAdmin
      .from('deposits')
      .select('package_name')
      .eq('status', 'confirmed')

    const packageDistribution: Record<string, number> = {}
    packageData?.forEach((d: any) => {
      const pkg = d.package_name || 'Unknown'
      packageDistribution[pkg] = (packageDistribution[pkg] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        pendingDeposits,
        pendingWithdrawals,
        activeInvestments,
        totalActiveAmount,
        totalProfitDistributed,
        onlineUsers: Math.floor(totalUsers * 0.3) + Math.floor(Math.random() * 5) + 1,
        packageDistribution
      }
    })

  } catch (error: any) {
    console.error('Admin stats fetch error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch stats',
      stats: {
        totalUsers: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        activeInvestments: 0,
        totalActiveAmount: 0,
        totalProfitDistributed: 0,
        onlineUsers: 0,
        packageDistribution: {}
      }
    })
  }
}
