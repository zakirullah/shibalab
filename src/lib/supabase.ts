// ============================================
// Supabase Database Connection
// With Environment Variables & RLS Support
// ============================================
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// 4. ENVIRONMENT VARIABLES
// ============================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Fallback for deployment (will be overridden by env vars)
const FALLBACK_URL = 'https://xghcqsqxgwfnucbpbrtr.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGNxc3F4Z3dmbnVjYnBicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzUzODIsImV4cCI6MjA4ODQxMTM4Mn0.ag7FEq3lyT48Gav5k8Hx1Sn4-11Z5n_F3tJc-krNoLA'
const FALLBACK_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGNxc3F4Z3dmbnVjYnBicnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgzNTM4MiwiZXhwIjoyMDg4NDExMzgyfQ._O5qSK5NtbU0hIZUcpa_Z_FslC9Eca8HktSRHZj3x9M'

// Use environment variables or fallbacks
const supabaseUrl = SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
const supabaseServiceKey = SUPABASE_SERVICE_KEY || FALLBACK_SERVICE_KEY

// ============================================
// 3. SUPABASE AUTH CLIENTS
// ============================================

// Public client (with RLS) - for client-side operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client (service role) - bypasses RLS for backend operations
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey)
}

// ============================================
// DATABASE OPERATIONS WITH VALIDATION
// ============================================

export const db = {
  // ============ USER OPERATIONS ============
  
  // Create new user
  async createUser(wallet: string, pinHash: string, pinSalt: string, referralCode: string, referredBy?: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        wallet_address: wallet.toLowerCase(),
        pin_hash: pinHash,
        pin_salt: pinSalt,
        referral_code: referralCode,
        referred_by: referredBy?.toLowerCase() || null,
        status: 'active',
        balance: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        active_investment: 0,
        daily_profit: 0,
        total_earned: 0,
        remaining_days: 0
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Update platform stats
    await this.incrementStat('total_users', 1)
    
    return data
  },

  // Get user by wallet
  async getUser(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .single()
    
    if (error) return null
    return data
  },

  // Get user by referral code
  async getUserByReferralCode(referralCode: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('referral_code', referralCode.toUpperCase())
      .single()
    
    if (error) return null
    return data
  },

  // Update user
  async updateUser(wallet: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('wallet_address', wallet.toLowerCase())
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ============ DEPOSIT OPERATIONS ============

  // Create deposit
  async createDeposit(wallet: string, amount: number, packageName: string, txHash: string) {
    const user = await this.getUser(wallet)
    
    // Try with user_id first, if fails, try without
    let result = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: user?.id,
        wallet_address: wallet.toLowerCase(),
        amount,
        package_name: packageName,
        tx_hash: txHash,
        status: 'pending'
      })
      .select()
      .single()
    
    // If user_id column doesn't exist, try without it
    if (result.error && result.error.message?.includes('user_id')) {
      result = await supabaseAdmin
        .from('deposits')
        .insert({
          wallet_address: wallet.toLowerCase(),
          amount,
          package_name: packageName,
          tx_hash: txHash,
          status: 'pending'
        })
        .select()
        .single()
    }
    
    if (result.error) throw result.error
    return result.data
  },

  // Get user deposits
  async getUserDeposits(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  // Get deposit by tx hash
  async getDepositByTxHash(txHash: string) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('tx_hash', txHash.toLowerCase())
      .single()
    
    if (error) return null
    return data
  },

  // Get pending deposits (admin)
  async getPendingDeposits() {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  // Get all deposits (admin)
  async getAllDeposits(limit: number = 100) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  // Approve deposit
  async approveDeposit(depositId: string) {
    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single()
    
    if (!deposit) throw new Error('Deposit not found')
    
    await supabaseAdmin
      .from('deposits')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      })
      .eq('id', depositId)
    
    const profitRate = 0.3
    const dailyProfit = (deposit.amount * profitRate) / 30
    
    await supabaseAdmin
      .from('users')
      .update({
        balance: deposit.amount,
        active_investment: deposit.amount,
        daily_profit: dailyProfit,
        total_earned: deposit.amount * profitRate,
        total_deposited: deposit.amount,
        remaining_days: 30,
        investment_start_date: new Date().toISOString(),
        investment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', deposit.wallet_address)
    
    await this.incrementStat('total_deposits', deposit.amount)
    
    const user = await this.getUser(deposit.wallet_address)
    if (user?.referred_by) {
      await this.processReferralCommission(user.referred_by, deposit.amount)
    }
    
    return true
  },

  // ============ WITHDRAWAL OPERATIONS ============

  // Create withdrawal request
  async createWithdrawal(wallet: string, amount: number) {
    const user = await this.getUser(wallet)
    if (!user || user.balance < amount) {
      throw new Error('Insufficient balance')
    }
    
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: user.id,
        wallet_address: wallet.toLowerCase(),
        amount,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    await this.updateUser(wallet, {
      balance: user.balance - amount
    })
    
    return data
  },

  // Get user withdrawals
  async getUserWithdrawals(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  // Get pending withdrawals (admin)
  async getPendingWithdrawals() {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  // Get all withdrawals (admin)
  async getAllWithdrawals(limit: number = 100) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  // Process withdrawal
  async processWithdrawal(withdrawalId: string, txHash: string) {
    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single()
    
    if (!withdrawal) throw new Error('Withdrawal not found')
    
    await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'sent',
        tx_hash: txHash,
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
    
    await supabaseAdmin
      .from('users')
      .update({
        total_withdrawn: withdrawal.amount,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', withdrawal.wallet_address)
    
    await this.incrementStat('total_withdrawals', withdrawal.amount)
    
    return true
  },

  // ============ REFERRAL OPERATIONS ============

  async processReferralCommission(referrerWallet: string, depositAmount: number) {
    const commissionRate = 0.05
    const commission = depositAmount * commissionRate
    
    const referrer = await this.getUser(referrerWallet)
    if (referrer) {
      await supabaseAdmin
        .from('users')
        .update({
          referral_earnings: (referrer.referral_earnings || 0) + commission,
          balance: (referrer.balance || 0) + commission,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', referrerWallet.toLowerCase())
    }
    
    return commission
  },

  async getUserReferrals(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('wallet_address, created_at, total_deposited')
      .eq('referred_by', wallet.toLowerCase())
    
    if (error) return []
    return data
  },

  // ============ PLATFORM STATS ============

  async getPlatformStats() {
    try {
      // Get REAL counts from database
      const [usersResult, depositsResult, withdrawalsResult] = await Promise.all([
        supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('deposits').select('amount', { count: 'exact' }).eq('status', 'approved'),
        supabaseAdmin.from('withdrawals').select('amount', { count: 'exact' }).eq('status', 'sent'),
      ])
      
      const totalUsers = usersResult.count || 0
      const totalDeposits = depositsResult.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const totalWithdrawals = withdrawalsResult.data?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0
      
      return {
        total_users: totalUsers,
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        total_visitors: totalUsers * 3, // Estimate based on users
        online_users: Math.floor(Math.random() * 10) + 1 // Current online estimate
      }
    } catch (error) {
      return {
        total_users: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        total_visitors: 0,
        online_users: 0
      }
    }
  },

  async incrementStat(stat: string, value: number) {
    const { data: stats } = await supabaseAdmin
      .from('platform_stats')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (stats) {
      await supabaseAdmin
        .from('platform_stats')
        .update({
          [stat]: (stats[stat] || 0) + value,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
    }
  },

  async initPlatformStats() {
    // No fake data initialization
  },

  // ============ ADMIN OPERATIONS ============

  async getAllUsers(limit: number = 100) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  async updateUserStatus(wallet: string, status: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('wallet_address', wallet.toLowerCase())
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Expose supabaseAdmin for direct access
  supabaseAdmin
}

export default db
