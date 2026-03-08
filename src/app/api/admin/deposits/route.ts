/**
 * Admin Deposit Management API
 * Handles manual deposit approval for fallback situations
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  validateTxHash,
  getClientIP,
  successResponse,
  errorResponse 
} from '@/lib/security'

/**
 * GET - Get all deposits with optional status filter
 */
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || 'all'
    
    let deposits
    if (status === 'all') {
      deposits = await db.getAllDeposits(100)
    } else if (status === 'pending') {
      deposits = await db.getPendingDeposits()
    } else {
      deposits = await db.getAllDeposits(100)
      deposits = deposits.filter(d => d.status === status)
    }
    
    return successResponse({ deposits })
    
  } catch (error: any) {
    console.error('Admin get deposits error:', error)
    return errorResponse(error.message || 'Failed to get deposits', 500)
  }
}

/**
 * POST - Manually approve or reject deposits (fallback)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, depositId, txHash, reason, adminWallet } = body
    
    if (!action || !depositId) {
      return errorResponse('Action and deposit ID are required')
    }
    
    const clientIP = getClientIP(request)
    
    switch (action) {
      case 'approve':
        // Manually approve deposit
        if (!txHash) {
          return errorResponse('Transaction hash is required for manual approval')
        }
        
        const txValidation = validateTxHash(txHash)
        if (!txValidation.valid) {
          return errorResponse(txValidation.error || 'Invalid transaction hash')
        }
        
        await db.confirmDeposit(depositId, txHash, 1)
        
        return successResponse({
          message: 'Deposit approved and balance credited.',
          depositId,
          txHash,
        })
        
      case 'reject':
        // Reject deposit
        await db.failDeposit(depositId, reason || 'Rejected by admin')
        return successResponse({
          message: 'Deposit rejected.',
          depositId,
        })
        
      case 'check_status':
        // Check deposit status from payment gateway
        const deposit = await db.getDeposit(depositId)
        if (!deposit) {
          return errorResponse('Deposit not found', 404)
        }
        
        // You can add gateway status check here
        return successResponse({
          deposit: {
            id: deposit.id,
            status: deposit.status,
            amount: deposit.amount,
            currency: deposit.currency,
            paymentId: deposit.payment_id,
            txHash: deposit.tx_hash,
            confirmations: deposit.confirmations,
            createdAt: deposit.created_at,
          },
        })
        
      default:
        return errorResponse('Invalid action. Use: approve, reject, or check_status')
    }
    
  } catch (error: any) {
    console.error('Admin deposit action error:', error)
    return errorResponse(error.message || 'Failed to process deposit', 500)
  }
}
