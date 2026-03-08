// ============================================
// 6. INPUT VALIDATION WITH ZOD
// ============================================
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

// Wallet address validation
export const walletSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format')
  .transform(val => val.toLowerCase())

// PIN validation (5 digits)
export const pinSchema = z.string()
  .length(5, 'PIN must be exactly 5 digits')
  .regex(/^\d{5}$/, 'PIN must contain only digits')

// Registration schema
export const registerSchema = z.object({
  wallet: z.string()
    .min(42, 'Wallet address must be 42 characters')
    .max(42, 'Wallet address must be 42 characters')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),
  pin: z.string()
    .length(5, 'PIN must be exactly 5 digits')
    .regex(/^\d{5}$/, 'PIN must contain only digits'),
  confirmPin: z.string()
    .length(5, 'PIN must be exactly 5 digits'),
  referralCode: z.string().optional()
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ["confirmPin"]
})

// Login schema
export const loginSchema = z.object({
  wallet: z.string()
    .min(42, 'Wallet address must be 42 characters')
    .max(42, 'Wallet address must be 42 characters')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),
  pin: z.string()
    .length(5, 'PIN must be exactly 5 digits')
    .regex(/^\d{5}$/, 'PIN must contain only digits')
})

// Deposit schema
export const depositSchema = z.object({
  wallet: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  amount: z.number()
    .min(100000, 'Minimum deposit is 100,000 SHIB')
    .max(10000000000, 'Maximum deposit is 10B SHIB'),
  txHash: z.string().min(10).max(200),
  packageName: z.string().optional()
})

// Withdrawal schema
export const withdrawalSchema = z.object({
  wallet: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  amount: z.number()
    .min(50000, 'Minimum withdrawal is 50,000 SHIB')
    .max(10000000000, 'Maximum withdrawal is 10B SHIB')
})

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Validate registration data
export function validateRegistration(data: unknown): 
  { success: true; data: z.infer<typeof registerSchema> } | { success: false; error: string } {
  try {
    const result = registerSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Validate login data
export function validateLogin(data: unknown):
  { success: true; data: z.infer<typeof loginSchema> } | { success: false; error: string } {
  try {
    const result = loginSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Validate deposit data
export function validateDeposit(data: unknown):
  { success: true; data: z.infer<typeof depositSchema> } | { success: false; error: string } {
  try {
    const result = depositSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Validate withdrawal data
export function validateWithdrawal(data: unknown):
  { success: true; data: z.infer<typeof withdrawalSchema> } | { success: false; error: string } {
  try {
    const result = withdrawalSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Sanitize input (remove potential XSS)
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000)
}

// Validate amount is positive number
export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && isFinite(amount)
}

// Check if string is valid UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Rate limiting helper (simple in-memory)
const rateLimits = new Map<string, { count: number; lastRequest: number }>()

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): 
  { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimits.get(key)
  
  if (!record || now - record.lastRequest > windowMs) {
    rateLimits.set(key, { count: 1, lastRequest: now })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  record.count++
  record.lastRequest = now
  return { allowed: true, remaining: maxRequests - record.count }
}
