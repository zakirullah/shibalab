/**
 * Database Operations for Crypto Payment System
 * Enhanced with activity logging and webhook support
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Fallback for deployment
const FALLBACK_URL = 'https://xghcqsqxgwfnucbpbrtr.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGNxc3F4Z3dmbnVjYnBicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzUzODIsImV4cCI6MjA4ODQxMTM4Mn0.ag7FEq3lyT48Gav5k8Hx1Sn4-11Z5n_F3tJc-krNoLA'
const FALLBACK_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGNxc3F4Z3dmbnVjYnBicnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgzNTM4MiwiZXhwIjoyMDg4NDExMzgyfQ._O5qSK5NtbU0hIZUcpa_Z_FslC9Eca8HktSRHZj3x9M'

const supabaseUrl = SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
const supabaseServiceKey = SUPABASE_SERVICE_KEY || FALLBACK_SERVICE_KEY

// Supabase clients
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey)
}

// ============================================
// DATABASE OPERATIONS
// ============================================

export const db = {
  // ============ USER OPERATIONS ============
  
  async createUser(wallet: string, pinHash: string, pinSalt: string, referralCode: string, referredBy?: string, email?: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        wallet_address: wallet.toLowerCase(),
        email: email || null,
        pin_hash: pinHash,
        pin_salt: pinSalt,
        referral_code: referralCode,
        referred_by: referredBy?.toLowerCase() || null,
        status: 'active',
        role: 'user',
        balance: 0,
        total_deposited: 0,
        total_withdrawn: 0,
      })
      .select()
      .single()
    
    if (error) throw error
    
    await this.logActivity(data.id, 'user_registered', 'user', data.id, { wallet, referralCode })
    
    return data
  },

  async getUser(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .single()
    
    if (error) return null
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },

  async getUserByReferralCode(referralCode: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('referral_code', referralCode.toUpperCase())
      .single()
    
    if (error) return null
    return data
  },

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

  async updateUserBalance(wallet: string, amount: number, operation: 'add' | 'subtract' = 'add') {
    const user = await this.getUser(wallet)
    if (!user) throw new Error('User not found')
    
    const newBalance = operation === 'add' 
      ? user.balance + amount 
      : user.balance - amount
    
    if (newBalance < 0) throw new Error('Insufficient balance')
    
    return this.updateUser(wallet, { balance: newBalance })
  },

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

  // ============ DEPOSIT OPERATIONS ============

  async createDeposit(data: {
    userId: string
    walletAddress: string
    amount: number
    paymentId?: string
    paymentAddress?: string
    paymentUrl?: string
    gateway?: string
    packageName?: string
    metadata?: Record<string, unknown>
    txHash?: string
  }) {
    const { data: deposit, error } = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: data.userId,
        wallet_address: data.walletAddress.toLowerCase(),
        amount: data.amount,
        package_name: data.packageName,
        tx_hash: data.txHash,
        status: 'pending',
      })
      .select()
      .single()
    
    if (error) throw error
    
    await this.logActivity(data.userId, 'deposit_created', 'deposit', deposit.id, {
      amount: data.amount,
      paymentId: data.paymentId,
    })
    
    return deposit
  },

  async getDeposit(id: string) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },

  async getDepositByPaymentId(paymentId: string) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('payment_id', paymentId)
      .single()
    
    if (error) return null
    return data
  },

  async getDepositByTxHash(txHash: string) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('tx_hash', txHash.toLowerCase())
      .single()
    
    if (error) return null
    return data
  },

  async getUserDeposits(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  async getPendingDeposits() {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  async getAllDeposits(limit: number = 100) {
    const { data, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  async confirmDeposit(depositId: string, txHash: string, confirmations: number = 1) {
    const deposit = await this.getDeposit(depositId)
    if (!deposit) throw new Error('Deposit not found')
    if (deposit.status === 'confirmed') throw new Error('Deposit already confirmed')
    
    // Update deposit status
    await supabaseAdmin
      .from('deposits')
      .update({
        status: 'confirmed',
        tx_hash: txHash.toLowerCase(),
        confirmations,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', depositId)
    
    // Update user balance and stats
    const user = await this.getUserById(deposit.user_id)
    if (user) {
      const profitRate = 0.3
      const dailyProfit = (deposit.amount * profitRate) / 30
      
      await supabaseAdmin
        .from('users')
        .update({
          balance: deposit.amount,
          active_investment: deposit.amount,
          daily_profit: dailyProfit,
          total_earned: deposit.amount * profitRate,
          total_deposited: (user.total_deposited || 0) + deposit.amount,
          remaining_days: 30,
          investment_start_date: new Date().toISOString(),
          investment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', deposit.user_id)
      
      // Process referral commission
      if (user.referred_by) {
        await this.processReferralCommission(user.referred_by, deposit.amount)
      }
      
      await this.logActivity(deposit.user_id, 'deposit_confirmed', 'deposit', depositId, {
        amount: deposit.amount,
        txHash,
      })
    }
    
    // Update platform stats
    await this.incrementStat('total_deposits', deposit.amount)
    
    return true
  },

  async failDeposit(depositId: string, reason?: string) {
    const deposit = await this.getDeposit(depositId)
    if (!deposit) throw new Error('Deposit not found')
    
    await supabaseAdmin
      .from('deposits')
      .update({
        status: 'failed',
        metadata: { ...deposit.metadata, failureReason: reason },
        updated_at: new Date().toISOString(),
      })
      .eq('id', depositId)
    
    await this.logActivity(deposit.user_id, 'deposit_failed', 'deposit', depositId, { reason })
    
    return true
  },

  // ============ WITHDRAWAL OPERATIONS ============

  async createWithdrawal(wallet: string, amount: number, walletAddress?: string) {
    const user = await this.getUser(wallet)
    if (!user) throw new Error('User not found')
    
    // Calculate available balance (excluding pending withdrawals)
    const pendingWithdrawals = await this.getPendingWithdrawalsByWallet(wallet)
    const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
    const availableBalance = user.balance - pendingAmount
    
    if (availableBalance < amount) {
      throw new Error('Insufficient balance')
    }
    
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: user.id,
        wallet_address: (walletAddress || wallet).toLowerCase(),
        amount,
        status: 'pending',
      })
      .select()
      .single()
    
    if (error) throw error
    
    await this.logActivity(user.id, 'withdrawal_created', 'withdrawal', data.id, {
      amount,
      walletAddress: walletAddress || wallet,
    })
    
    return data
  },

  async getWithdrawal(id: string) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },

  async getUserWithdrawals(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  async getPendingWithdrawals() {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data
  },

  async getPendingWithdrawalsByWallet(wallet: string) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .eq('status', 'pending')
    
    if (error) return []
    return data
  },

  async getAllWithdrawals(limit: number = 100) {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  async approveWithdrawal(withdrawalId: string, adminWallet: string) {
    const withdrawal = await this.getWithdrawal(withdrawalId)
    if (!withdrawal) throw new Error('Withdrawal not found')
    if (withdrawal.status !== 'pending') throw new Error('Withdrawal is not pending')
    
    await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'approved',
        processed_by: adminWallet,
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
    
    await this.logActivity(withdrawal.user_id, 'withdrawal_approved', 'withdrawal', withdrawalId, {
      amount: withdrawal.amount,
      approvedBy: adminWallet,
    })
    
    return true
  },

  async rejectWithdrawal(withdrawalId: string, adminWallet: string, reason?: string) {
    const withdrawal = await this.getWithdrawal(withdrawalId)
    if (!withdrawal) throw new Error('Withdrawal not found')
    if (withdrawal.status !== 'pending') throw new Error('Withdrawal is not pending')
    
    await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'rejected',
        processed_by: adminWallet,
        admin_notes: reason,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
    
    await this.logActivity(withdrawal.user_id, 'withdrawal_rejected', 'withdrawal', withdrawalId, {
      amount: withdrawal.amount,
      rejectedBy: adminWallet,
      reason,
    })
    
    return true
  },

  async completeWithdrawal(withdrawalId: string, txHash: string) {
    const withdrawal = await this.getWithdrawal(withdrawalId)
    if (!withdrawal) throw new Error('Withdrawal not found')
    
    await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'completed',
        tx_hash: txHash,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
    
    // Update user stats
    const user = await this.getUserById(withdrawal.user_id)
    if (user) {
      await supabaseAdmin
        .from('users')
        .update({
          total_withdrawn: (user.total_withdrawn || 0) + withdrawal.amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', withdrawal.user_id)
    }
    
    // Update platform stats
    await this.incrementStat('total_withdrawals', withdrawal.amount)
    
    await this.logActivity(withdrawal.user_id, 'withdrawal_completed', 'withdrawal', withdrawalId, {
      amount: withdrawal.amount,
      txHash,
    })
    
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
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', referrerWallet.toLowerCase())
      
      await this.logActivity(referrer.id, 'referral_commission', 'referral', null, {
        amount: commission,
        fromDeposit: depositAmount,
      })
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
    const { data, error } = await supabaseAdmin
      .from('platform_stats')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error) {
      return {
        total_users: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        total_visitors: 0,
        online_users: 0,
      }
    }
    
    return data
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
    }
  },

  // ============ ACTIVITY LOGGING ============

  async logActivity(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    details: Record<string, unknown>,
    ipAddress?: string
  ) {
    try {
      await supabaseAdmin
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          ip_address: ipAddress,
        })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  },

  async getUserActivityLogs(userId: string, limit: number = 50) {
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  },

  // ============ PAYMENT CONFIG ============

  async getPaymentConfig() {
    const { data, error } = await supabaseAdmin
      .from('payment_config')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error) {
      return {
        gateway: 'coinpayments',
        is_active: true,
        min_deposit: 100000,
        min_withdrawal: 50000,
        deposit_currencies: ['SHIB', 'USDT', 'BNB', 'ETH'],
        withdrawal_currencies: ['SHIB'],
      }
    }
    
    return data
  },

  // Expose supabaseAdmin for direct access
  supabaseAdmin,
}

export default db
