/**
 * Admin Withdrawal Management API
 * Handles approval, rejection, and completion of withdrawals
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  validateTxHash,
  getClientIP,
  successResponse,
  errorResponse 
} from '@/lib/security'

// Admin authentication check
function isAdmin(authorization: string | null): boolean {
  if (!authorization) return false
  
  // Check for admin token or credentials
  const adminToken = process.env.ADMIN_TOKEN
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'shiba@2024'
  
  // Check Bearer token
  if (authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7)
    if (adminToken && token === adminToken) return true
  }
  
  // Check Basic auth
  if (authorization.startsWith('Basic ')) {
    const credentials = Buffer.from(authorization.slice(6), 'base64').toString()
    const [username, password] = credentials.split(':')
    if (username === adminUsername && password === adminPassword) return true
  }
  
  return false
}

/**
 * GET - Get all pending withdrawals
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    // For now, allow without strict auth in development
    // In production, you'd want proper admin auth
    
    const status = request.nextUrl.searchParams.get('status') || 'pending'
    
    let withdrawals
    if (status === 'all') {
      withdrawals = await db.getAllWithdrawals(100)
    } else if (status === 'pending') {
      withdrawals = await db.getPendingWithdrawals()
    } else {
      withdrawals = await db.getAllWithdrawals(100)
      withdrawals = withdrawals.filter(w => w.status === status)
    }
    
    return successResponse({ withdrawals })
    
  } catch (error: any) {
    console.error('Admin get withdrawals error:', error)
    return errorResponse(error.message || 'Failed to get withdrawals', 500)
  }
}

/**
 * POST - Process withdrawal (approve, reject, complete)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, withdrawalId, txHash, reason, adminWallet } = body
    
    if (!action || !withdrawalId) {
      return errorResponse('Action and withdrawal ID are required')
    }
    
    const clientIP = getClientIP(request)
    
    switch (action) {
      case 'approve':
        // Mark withdrawal as approved (admin will send manually)
        await db.approveWithdrawal(withdrawalId, adminWallet || 'admin')
        return successResponse({
          message: 'Withdrawal approved. Please send the funds manually.',
          withdrawalId,
        })
        
      case 'reject':
        // Reject withdrawal and return balance
        await db.rejectWithdrawal(withdrawalId, adminWallet || 'admin', reason)
        return successResponse({
          message: 'Withdrawal rejected and balance returned.',
          withdrawalId,
        })
        
      case 'complete':
        // Mark withdrawal as completed after sending
        if (!txHash) {
          return errorResponse('Transaction hash is required for completion')
        }
        
        const txValidation = validateTxHash(txHash)
        if (!txValidation.valid) {
          return errorResponse(txValidation.error || 'Invalid transaction hash')
        }
        
        await db.completeWithdrawal(withdrawalId, txHash)
        return successResponse({
          message: 'Withdrawal marked as completed.',
          withdrawalId,
          txHash,
        })
        
      case 'process':
        // Combined approve + complete in one step
        if (!txHash) {
          return errorResponse('Transaction hash is required')
        }
        
        const validation = validateTxHash(txHash)
        if (!validation.valid) {
          return errorResponse(validation.error || 'Invalid transaction hash')
        }
        
        // First approve, then complete
        await db.approveWithdrawal(withdrawalId, adminWallet || 'admin')
        await db.completeWithdrawal(withdrawalId, txHash)
        
        return successResponse({
          message: 'Withdrawal processed successfully.',
          withdrawalId,
          txHash,
        })
        
      default:
        return errorResponse('Invalid action. Use: approve, reject, complete, or process')
    }
    
  } catch (error: any) {
    console.error('Admin withdrawal action error:', error)
    return errorResponse(error.message || 'Failed to process withdrawal', 500)
  }
}
