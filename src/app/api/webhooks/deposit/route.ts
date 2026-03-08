/**
 * CoinPayments IPN Webhook Handler
 * Handles automatic deposit confirmations
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyIPNSignature, STATUS_CODES } from '@/lib/payment/coinpayments'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    
    // Verify HMAC signature from CoinPayments
    const hmacHeader = request.headers.get('hmac') || ''
    
    if (!verifyIPNSignature(hmacHeader, rawBody)) {
      console.error('Invalid IPN signature')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    // Parse the IPN data
    const ipnData: Record<string, string> = {}
    const params = new URLSearchParams(rawBody)
    params.forEach((value, key) => {
      ipnData[key] = value
    })
    
    // Extract key fields
    const {
      ipn_mode,
      ipn_id,
      ipn_type,
      merchant,
      status: statusStr,
      status_text,
      txn_id,
      amount1,
      amount2,
      currency1,
      currency2,
      buyer_name,
      email,
      item_name,
      item_number,
      custom,
      fee,
      net,
      receives_at,
      received_amount,
      received_confirms,
    } = ipnData
    
    const status = parseInt(statusStr, 10)
    
    console.log('IPN Received:', {
      ipn_id,
      txn_id,
      status,
      status_text,
      amount: amount1,
      currency: currency2,
    })
    
    // Find the deposit by payment ID (txn_id from CoinPayments)
    const deposit = await db.getDepositByPaymentId(txn_id)
    
    if (!deposit) {
      console.error('Deposit not found for payment ID:', txn_id)
      return NextResponse.json(
        { success: false, error: 'Deposit not found' },
        { status: 404 }
      )
    }
    
    // Handle based on status
    switch (status) {
      case STATUS_CODES.PAYMENT_COMPLETE:
        // Payment fully complete
        await handleCompletePayment(deposit.id, txn_id, received_amount, received_confirms)
        break
        
      case STATUS_CODES.PAYMENT_RECEIVED:
        // Payment received, waiting for confirmations
        await handlePaymentReceived(deposit.id, txn_id, received_amount, received_confirms)
        break
        
      case STATUS_CODES.WAITING_FOR_FUNDS:
        // Still waiting for buyer to send funds
        await updateDepositStatus(deposit.id, 'pending', txn_id, parseInt(received_confirms || '0', 10))
        break
        
      case STATUS_CODES.CANCELLED:
        // Payment cancelled or timed out
        await db.failDeposit(deposit.id, 'Payment cancelled or timed out')
        break
        
      case STATUS_CODES.REFUNDED:
        // Payment was refunded
        await db.failDeposit(deposit.id, 'Payment refunded')
        break
        
      default:
        console.log('Unhandled status:', status, status_text)
    }
    
    // Return success to CoinPayments
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('IPN processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle complete payment
 */
async function handleCompletePayment(
  depositId: string,
  txHash: string,
  receivedAmount: string,
  confirmations: string
) {
  try {
    const confs = parseInt(confirmations || '1', 10)
    await db.confirmDeposit(depositId, txHash, confs)
    console.log('Deposit confirmed:', depositId)
  } catch (error) {
    console.error('Failed to confirm deposit:', error)
    throw error
  }
}

/**
 * Handle payment received (waiting confirmations)
 */
async function handlePaymentReceived(
  depositId: string,
  txHash: string,
  receivedAmount: string,
  confirmations: string
) {
  try {
    const confs = parseInt(confirmations || '0', 10)
    
    // Update deposit with received info but keep pending
    await db.supabaseAdmin
      .from('deposits')
      .update({
        tx_hash: txHash,
        confirmations: confs,
        metadata: { receivedAmount },
        updated_at: new Date().toISOString(),
      })
      .eq('id', depositId)
    
    console.log('Payment received, waiting confirmations:', depositId, confs)
  } catch (error) {
    console.error('Failed to update payment received:', error)
  }
}

/**
 * Update deposit status
 */
async function updateDepositStatus(
  depositId: string,
  status: string,
  txHash: string,
  confirmations: number
) {
  try {
    await db.supabaseAdmin
      .from('deposits')
      .update({
        status,
        tx_hash: txHash,
        confirmations,
        updated_at: new Date().toISOString(),
      })
      .eq('id', depositId)
  } catch (error) {
    console.error('Failed to update deposit status:', error)
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET(request: NextRequest) {
  // Some gateways require a GET endpoint for verification
  const challenge = request.nextUrl.searchParams.get('challenge')
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is active',
  })
}
