/**
 * CoinPayments Payment Gateway Integration
 * Handles deposit creation and IPN webhook processing
 */

import crypto from 'crypto'

// CoinPayments API Configuration
const COINPAYMENTS_API_URL = process.env.COINPAYMENTS_API_URL || 'https://a-api.coinpayments.net'
const COINPAYMENTS_PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY || ''
const COINPAYMENTS_PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY || ''
const COINPAYMENTS_IPN_SECRET = process.env.COINPAYMENTS_IPN_SECRET || ''
const COINPAYMENTS_MERCHANT_ID = process.env.COINPAYMENTS_MERCHANT_ID || ''

// Types
export interface CreateDepositParams {
  amount: number
  currency: string
  buyerEmail?: string
  buyerName?: string
  itemName: string
  itemNumber: string
  custom: string
  ipnUrl: string
  successUrl: string
  cancelUrl: string
}

export interface DepositResponse {
  success: boolean
  txnId?: string
  address?: string
  amount?: number
  checkoutUrl?: string
  statusUrl?: string
  qrcodeUrl?: string
  error?: string
}

export interface IPNData {
  ipn_mode: string
  ipn_id: string
  ipn_type: string
  merchant: string
  status: number
  status_text: string
  txn_id: string
  amount1: string
  amount2: string
  currency1: string
  currency2: string
  buyer_name: string
  email: string
  item_name: string
  item_number: string
  custom: string
  fee: string
  net: string
  receives_at: string
  received_amount: string
  received_confirms: string
}

// Status codes from CoinPayments
export const STATUS_CODES = {
  WAITING_FOR_FUNDS: 0,        // Waiting for buyer funds
  FIAT_DEPOSIT_PENDING: 1,     // Fiat deposit pending (for fiat-to-crypto)
  FIAT_DEPOSIT_CONFIRMED: 2,   // Fiat deposit confirmed
  PAYMENT_RECEIVED: 3,         // Payment received, waiting for confirms
  PAYMENT_COMPLETE: 4,         // Payment complete
  CANCELLED: -1,               // Cancelled / Timed out
  REFUNDED: -2,                // Refunded
  COMPLAINT_FILED: -3,         // Complaint filed
}

/**
 * Generate HMAC signature for CoinPayments API
 */
function generateSignature(params: Record<string, string>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  return crypto
    .createHmac('sha512', COINPAYMENTS_PRIVATE_KEY)
    .update(sortedParams)
    .digest('hex')
}

/**
 * Create a deposit/payment request
 */
export async function createDeposit(params: CreateDepositParams): Promise<DepositResponse> {
  try {
    const apiParams: Record<string, string> = {
      cmd: 'create_transaction',
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      amount: params.amount.toString(),
      currency1: 'USD', // Base currency
      currency2: params.currency, // Target crypto currency
      buyer_email: params.buyerEmail || '',
      buyer_name: params.buyerName || '',
      item_name: params.itemName,
      item_number: params.itemNumber,
      custom: params.custom,
      ipn_url: params.ipnUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }
    
    // Generate signature
    const signature = generateSignature(apiParams)
    
    // Make API request
    const formData = new URLSearchParams()
    Object.entries(apiParams).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': signature,
      },
      body: formData.toString(),
    })
    
    const data = await response.json()
    
    if (data.error && data.error !== 'ok') {
      return {
        success: false,
        error: data.error,
      }
    }
    
    return {
      success: true,
      txnId: data.result?.txn_id,
      address: data.result?.address,
      amount: parseFloat(data.result?.amount || '0'),
      checkoutUrl: data.result?.checkout_url,
      statusUrl: data.result?.status_url,
      qrcodeUrl: data.result?.qrcode_url,
    }
  } catch (error: any) {
    console.error('CoinPayments create deposit error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create deposit',
    }
  }
}

/**
 * Verify IPN webhook signature
 */
export function verifyIPNSignature(
  hmacHeader: string,
  body: string
): boolean {
  try {
    if (!hmacHeader || !COINPAYMENTS_IPN_SECRET) {
      return false
    }
    
    const expectedHmac = crypto
      .createHmac('sha512', COINPAYMENTS_IPN_SECRET)
      .update(body)
      .digest('hex')
    
    return hmacHeader === expectedHmac
  } catch (error) {
    console.error('IPN signature verification error:', error)
    return false
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txnId: string): Promise<{
  success: boolean
  status?: number
  statusText?: string
  amount?: number
  error?: string
}> {
  try {
    const apiParams: Record<string, string> = {
      cmd: 'get_tx_info',
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      txid: txnId,
    }
    
    const signature = generateSignature(apiParams)
    
    const formData = new URLSearchParams()
    Object.entries(apiParams).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': signature,
      },
      body: formData.toString(),
    })
    
    const data = await response.json()
    
    if (data.error && data.error !== 'ok') {
      return {
        success: false,
        error: data.error,
      }
    }
    
    return {
      success: true,
      status: data.result?.status,
      statusText: data.result?.status_text,
      amount: parseFloat(data.result?.receivedf || '0'),
    }
  } catch (error: any) {
    console.error('Get transaction status error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Create withdrawal (for manual processing by admin)
 */
export async function createWithdrawal(params: {
  amount: number
  currency: string
  address: string
  autoConfirm: boolean
}): Promise<{
  success: boolean
  txnId?: string
  amount?: number
  error?: string
}> {
  try {
    const apiParams: Record<string, string> = {
      cmd: 'create_withdrawal',
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      amount: params.amount.toString(),
      currency: params.currency,
      address: params.address,
      auto_confirm: params.autoConfirm ? '1' : '0',
    }
    
    const signature = generateSignature(apiParams)
    
    const formData = new URLSearchParams()
    Object.entries(apiParams).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': signature,
      },
      body: formData.toString(),
    })
    
    const data = await response.json()
    
    if (data.error && data.error !== 'ok') {
      return {
        success: false,
        error: data.error,
      }
    }
    
    return {
      success: true,
      txnId: data.result?.id,
      amount: parseFloat(data.result?.amount || '0'),
    }
  } catch (error: any) {
    console.error('Create withdrawal error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Get callback address for deposits
 */
export async function getCallbackAddress(
  currency: string,
  ipnUrl: string
): Promise<{
  success: boolean
  address?: string
  error?: string
}> {
  try {
    const apiParams: Record<string, string> = {
      cmd: 'get_callback_address',
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      currency: currency,
      ipn_url: ipnUrl,
    }
    
    const signature = generateSignature(apiParams)
    
    const formData = new URLSearchParams()
    Object.entries(apiParams).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': signature,
      },
      body: formData.toString(),
    })
    
    const data = await response.json()
    
    if (data.error && data.error !== 'ok') {
      return {
        success: false,
        error: data.error,
      }
    }
    
    return {
      success: true,
      address: data.result?.address,
    }
  } catch (error: any) {
    console.error('Get callback address error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export default {
  createDeposit,
  verifyIPNSignature,
  getTransactionStatus,
  createWithdrawal,
  getCallbackAddress,
  STATUS_CODES,
}
