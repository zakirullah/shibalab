import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { validateRegistration, sanitizeInput, checkRateLimit } from '@/lib/validation'
import crypto from 'crypto'

// Hash PIN with salt
function hashPin(pin: string, salt: string): string {
  return crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex')
}

// Generate random salt
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Generate referral code
function generateReferralCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // RATE LIMITING
    // ============================================
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60000)
    
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: 'Too many registration attempts. Please wait 1 minute.' 
      }, { status: 429 })
    }

    const body = await request.json()
    
    // ============================================
    // 6. INPUT VALIDATION
    // ============================================
    const validation = validateRegistration({
      wallet: sanitizeInput(body.wallet || ''),
      pin: body.pin || '',
      confirmPin: body.confirmPin || body.pin || '',
      referralCode: body.referralCode
    })
    
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: validation.error 
      }, { status: 400 })
    }
    
    const { wallet, pin, referralCode } = validation.data

    // Check if user already exists
    const existingUser = await db.getUser(wallet)
    
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User already exists. Please login.' 
      }, { status: 400 })
    }

    // Check referral code if provided
    let referrer = null
    if (referralCode) {
      referrer = await db.getUserByReferralCode(referralCode)
    }

    // Generate salt and hash PIN
    const salt = generateSalt()
    const pinHash = hashPin(pin, salt)
    const newReferralCode = generateReferralCode()

    // Create user in database
    const user = await db.createUser(
      wallet, 
      pinHash, 
      salt, 
      newReferralCode,
      referrer?.wallet_address
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please login.',
      user: {
        wallet: user.wallet_address,
        referralCode: user.referral_code
      }
    })

  } catch (error: unknown) {
    console.error('Registration error:', error)
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ 
      success: false, 
      message 
    }, { status: 500 })
  }
}
