/**
 * Security Utilities
 * Rate limiting, input validation, and security helpers
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================
// RATE LIMITER
// ============================================

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10)

/**
 * Simple in-memory rate limiter
 */
export function rateLimit(identifier: string): {
  success: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const record = rateLimitStore[identifier]
  
  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
    return {
      success: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }
  
  record.count++
  return {
    success: true,
    remaining: RATE_LIMIT_MAX - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (xRealIP) return xRealIP
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
  
  return 'unknown'
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const ip = getClientIP(request)
    const { success, remaining, resetTime } = rateLimit(ip)
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    return handler(request)
  }
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate wallet address
 */
export function validateWalletAddress(address: string): {
  valid: boolean
  error?: string
} {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Wallet address is required' }
  }
  
  const trimmed = address.trim()
  
  // Ethereum/BSC address format
  if (trimmed.startsWith('0x')) {
    if (trimmed.length !== 42) {
      return { valid: false, error: 'Invalid Ethereum address length' }
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return { valid: false, error: 'Invalid Ethereum address format' }
    }
    return { valid: true }
  }
  
  // Bitcoin address format (basic check)
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return { valid: true }
  }
  
  // Bech32 Bitcoin address
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(trimmed)) {
    return { valid: true }
  }
  
  return { valid: false, error: 'Unsupported wallet address format' }
}

/**
 * Validate amount
 */
export function validateAmount(
  amount: number | string,
  min: number = 0,
  max?: number
): { valid: boolean; value?: number; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid amount' }
  }
  
  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }
  
  if (num < min) {
    return { valid: false, error: `Minimum amount is ${min.toLocaleString()}` }
  }
  
  if (max && num > max) {
    return { valid: false, error: `Maximum amount is ${max.toLocaleString()}` }
  }
  
  return { valid: true, value: num }
}

/**
 * Validate PIN code
 */
export function validatePIN(pin: string): { valid: boolean; error?: string } {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, error: 'PIN is required' }
  }
  
  if (!/^\d{5}$/.test(pin)) {
    return { valid: false, error: 'PIN must be exactly 5 digits' }
  }
  
  return { valid: true }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential XSS characters
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true }
}

/**
 * Validate transaction hash
 */
export function validateTxHash(txHash: string): { valid: boolean; error?: string } {
  if (!txHash || typeof txHash !== 'string') {
    return { valid: false, error: 'Transaction hash is required' }
  }
  
  const trimmed = txHash.trim()
  
  // Ethereum/BSC transaction hash
  if (trimmed.startsWith('0x')) {
    if (trimmed.length !== 66) {
      return { valid: false, error: 'Invalid transaction hash length' }
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      return { valid: false, error: 'Invalid transaction hash format' }
    }
    return { valid: true }
  }
  
  // Bitcoin transaction hash
  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
    return { valid: true }
  }
  
  return { valid: false, error: 'Invalid transaction hash format' }
}

// ============================================
// HASHING UTILITIES
// ============================================

import crypto from 'crypto'

/**
 * Generate random salt
 */
export function generateSalt(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash PIN with salt
 */
export function hashPIN(pin: string, salt: string): string {
  return crypto
    .pbkdf2Sync(pin, salt, 100000, 64, 'sha512')
    .toString('hex')
}

/**
 * Verify PIN
 */
export function verifyPIN(pin: string, hash: string, salt: string): boolean {
  const newHash = hashPIN(pin, salt)
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(newHash, 'hex')
  )
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ============================================
// WEBHOOK SECURITY
// ============================================

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    return false
  }
}

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...details,
    },
    { status }
  )
}

/**
 * Create success response
 */
export function successResponse(
  data: Record<string, unknown>,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  )
}

export default {
  rateLimit,
  getClientIP,
  withRateLimit,
  validateWalletAddress,
  validateAmount,
  validatePIN,
  validateEmail,
  validateTxHash,
  sanitizeString,
  generateSalt,
  hashPIN,
  verifyPIN,
  generateSecureToken,
  generateReferralCode,
  verifyWebhookSignature,
  errorResponse,
  successResponse,
}
