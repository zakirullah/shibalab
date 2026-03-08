/**
 * Deposit API
 * Handles both automatic (via payment gateway) and manual deposits
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { 
  validateWalletAddress, 
  validateAmount, 
  validateTxHash,
  getClientIP,
  successResponse,
  errorResponse 
} from '@/lib/security'

const MIN_DEPOSIT = parseInt(process.env.MIN_DEPOSIT || '100000', 10)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, txHash, packageName } = body
    
    // Validate wallet address
    const walletValidation = validateWalletAddress(wallet)
    if (!walletValidation.valid) {
      return errorResponse(walletValidation.error || 'Invalid wallet address')
    }
    
    // Validate amount
    const amountValidation = validateAmount(amount, MIN_DEPOSIT)
    if (!amountValidation.valid) {
      return errorResponse(amountValidation.error || 'Invalid amount')
    }
    
    // Validate transaction hash
    const txValidation = validateTxHash(txHash)
    if (!txValidation.valid) {
      return errorResponse(txValidation.error || 'Invalid transaction hash')
    }
    
    const depositAmount = amountValidation.value!
    const clientIP = getClientIP(request)
    
    // Get user
    const user = await db.getUser(wallet)
    if (!user) {
      return errorResponse('User not found. Please register first.', 404)
    }
    
    if (user.status !== 'active') {
      return errorResponse('Account is not active', 403)
    }
    
    // Check for duplicate transaction
    const existingDeposit = await db.getDepositByTxHash(txHash)
    if (existingDeposit) {
      return errorResponse('Transaction already processed', 400)
    }
    
    // Create deposit record (manual deposits need admin approval)
    const deposit = await db.createDeposit(
      wallet,
      depositAmount,
      packageName || 'Custom',
      txHash
    )
    
    return successResponse({
      message: 'Deposit submitted successfully! It will be verified within 24 hours.',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.created_at,
      },
    })
    
  } catch (error: any) {
    console.error('Deposit error:', error)
    return errorResponse(error.message || 'Deposit submission failed', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return errorResponse('Wallet address is required', 400)
    }

    const deposits = await db.getUserDeposits(wallet)

    return successResponse({ deposits })

  } catch (error: any) {
    console.error('Get deposits error:', error)
    return errorResponse(error.message || 'Failed to get deposits', 500)
  }
}
