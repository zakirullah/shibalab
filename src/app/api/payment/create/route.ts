/**
 * Payment Creation API
 * Creates deposit invoices with CoinPayments
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createDeposit } from '@/lib/payment/coinpayments'
import { 
  validateWalletAddress, 
  validateAmount, 
  getClientIP,
  successResponse,
  errorResponse 
} from '@/lib/security'

const MIN_DEPOSIT = parseInt(process.env.MIN_DEPOSIT || '100000', 10)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, currency = 'SHIB', packageName } = body
    
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
    
    // Get user
    const user = await db.getUser(wallet)
    if (!user) {
      return errorResponse('User not found. Please register first.', 404)
    }
    
    if (user.status !== 'active') {
      return errorResponse('Account is not active', 403)
    }
    
    // Get IP for logging
    const clientIP = getClientIP(request)
    
    // Create payment with CoinPayments
    const paymentResult = await createDeposit({
      amount: amountValidation.value!,
      currency,
      buyerEmail: user.email || undefined,
      buyerName: user.wallet_address.slice(0, 10),
      itemName: `ShibaLab ${packageName || 'Deposit'}`,
      itemNumber: `DEP-${Date.now()}`,
      custom: JSON.stringify({
        userId: user.id,
        wallet: user.wallet_address,
        packageName,
      }),
      ipnUrl: `${APP_URL}/api/webhooks/deposit`,
      successUrl: `${APP_URL}/dashboard?deposit=success`,
      cancelUrl: `${APP_URL}/dashboard?deposit=cancelled`,
    })
    
    if (!paymentResult.success) {
      return errorResponse(paymentResult.error || 'Failed to create payment')
    }
    
    // Create deposit record in database
    const deposit = await db.createDeposit({
      userId: user.id,
      walletAddress: user.wallet_address,
      amount: amountValidation.value!,
      currency,
      paymentId: paymentResult.txnId,
      paymentAddress: paymentResult.address,
      paymentUrl: paymentResult.checkoutUrl,
      gateway: 'coinpayments',
      packageName,
      metadata: {
        statusUrl: paymentResult.statusUrl,
        qrcodeUrl: paymentResult.qrcodeUrl,
      },
    })
    
    return successResponse({
      message: 'Payment invoice created successfully',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: deposit.currency,
        status: deposit.status,
      },
      payment: {
        txnId: paymentResult.txnId,
        address: paymentResult.address,
        amount: paymentResult.amount,
        checkoutUrl: paymentResult.checkoutUrl,
        statusUrl: paymentResult.statusUrl,
        qrcodeUrl: paymentResult.qrcodeUrl,
      },
    })
    
  } catch (error: any) {
    console.error('Create payment error:', error)
    return errorResponse(error.message || 'Failed to create payment', 500)
  }
}
