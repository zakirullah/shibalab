import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address required' 
      })
    }
    
    // Get user data
    const user = await db.getUser(wallet)
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    // Get user deposits
    const deposits = await db.getUserDeposits(wallet)
    
    // Get user withdrawals
    const withdrawals = await db.getUserWithdrawals(wallet)
    
    // Calculate remaining days
    let remainingDays = 0
    if (user.investment_end_date) {
      const endDate = new Date(user.investment_end_date)
      const now = new Date()
      const diffMs = endDate.getTime() - now.getTime()
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }
    
    // Calculate current balance based on investment progress
    // Balance increases as mining progresses
    let currentBalance = user.balance || 0
    if (user.active_investment > 0 && user.investment_start_date) {
      const startDate = new Date(user.investment_start_date)
      const now = new Date()
      const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysPassed > 0 && daysPassed <= 30) {
        // Calculate earned amount based on days passed
        const dailyProfit = (user.active_investment * 0.4) / 30
        const earnedSoFar = dailyProfit * daysPassed
        currentBalance = user.active_investment + earnedSoFar
      }
    }
    
    const userData = {
      id: user.id,
      wallet: user.wallet_address,
      balance: Math.floor(currentBalance),
      totalDeposited: user.total_deposited || 0,
      totalWithdrawn: user.total_withdrawn || 0,
      activeInvestment: user.active_investment || 0,
      dailyProfit: user.daily_profit || 0,
      totalEarned: user.total_earned || 0,
      remainingDays: remainingDays,
      referralCode: user.referral_code,
      status: user.status,
      investmentStartDate: user.investment_start_date,
      investmentEndDate: user.investment_end_date,
      referralEarnings: user.referral_earnings || 0,
      deposits: deposits,
      withdrawals: withdrawals
    }
    
    return NextResponse.json({ 
      success: true, 
      user: userData 
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}
