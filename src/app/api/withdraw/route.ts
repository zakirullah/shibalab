/**
 * Withdrawal API
 * Handles user withdrawal requests with validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  validateWalletAddress, 
  validateAmount, 
  getClientIP,
  successResponse,
  errorResponse 
} from '@/lib/security'

const MIN_WITHDRAWAL = parseInt(process.env.MIN_WITHDRAWAL || '50000', 10)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, walletAddress } = body
    
    // Validate wallet address
    const walletValidation = validateWalletAddress(wallet)
    if (!walletValidation.valid) {
      return errorResponse(walletValidation.error || 'Invalid wallet address')
    }
    
    // Validate withdrawal amount
    const amountValidation = validateAmount(amount, MIN_WITHDRAWAL)
    if (!amountValidation.valid) {
      return errorResponse(amountValidation.error || 'Invalid amount')
    }
    
    // Validate destination wallet if provided
    if (walletAddress) {
      const destWalletValidation = validateWalletAddress(walletAddress)
      if (!destWalletValidation.valid) {
        return errorResponse('Invalid destination wallet address')
      }
    }
    
    const withdrawAmount = amountValidation.value!
    
    // Create withdrawal request
    try {
      const withdrawal = await db.createWithdrawal(
        wallet, 
        withdrawAmount, 
        walletAddress || wallet
      )
      
      // Log activity
      const user = await db.getUser(wallet)
      if (user) {
        const clientIP = getClientIP(request)
        await db.logActivity(
          user.id,
          'withdrawal_requested',
          'withdrawal',
          withdrawal.id,
          { amount: withdrawAmount, walletAddress: walletAddress || wallet },
          clientIP
        )
      }
      
      return successResponse({
        message: 'Withdrawal request submitted successfully. It will be processed within 24-48 hours.',
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          createdAt: withdrawal.created_at,
        },
      })
      
    } catch (error: any) {
      if (error.message === 'Insufficient balance') {
        return errorResponse('Insufficient balance for this withdrawal', 400)
      }
      throw error
    }
    
  } catch (error: any) {
    console.error('Withdrawal error:', error)
    return errorResponse(error.message || 'Withdrawal request failed', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return errorResponse('Wallet address is required', 400)
    }

    const withdrawals = await db.getUserWithdrawals(wallet)

    return successResponse({ withdrawals })

  } catch (error: any) {
    console.error('Get withdrawals error:', error)
    return errorResponse(error.message || 'Failed to get withdrawals', 500)
  }
}
