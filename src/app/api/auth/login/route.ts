import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { validateLogin, sanitizeInput, checkRateLimit } from '@/lib/validation'
import crypto from 'crypto'

// Hash PIN with salt
function hashPin(pin: string, salt: string): string {
  return crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // RATE LIMITING
    // ============================================
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60000)
    
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: 'Too many login attempts. Please wait 1 minute.' 
      }, { status: 429 })
    }
    
    const body = await request.json()
    
    // ============================================
    // 6. INPUT VALIDATION
    // ============================================
    const validation = validateLogin({
      wallet: sanitizeInput(body.wallet || ''),
      pin: body.pin || ''
    })
    
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: validation.error 
      }, { status: 400 })
    }
    
    const { wallet, pin } = validation.data

    // Get user from database
    const user = await db.getUser(wallet)

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      }, { status: 404 })
    }

    // Verify PIN using stored salt
    const pinHash = hashPin(pin, user.pin_salt)
    
    if (pinHash !== user.pin_hash) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid PIN. Please try again.' 
      }, { status: 401 })
    }

    // Check user status
    if (user.status === 'banned') {
      return NextResponse.json({ 
        success: false, 
        message: 'Account has been suspended. Please contact support.' 
      }, { status: 403 })
    }

    // Return user data
    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        wallet: user.wallet_address,
        balance: Number(user.balance) || 0,
        totalDeposited: Number(user.total_deposited) || 0,
        totalWithdrawn: Number(user.total_withdrawn) || 0,
        activeInvestment: Number(user.active_investment) || 0,
        dailyProfit: Number(user.daily_profit) || 0,
        totalEarned: Number(user.total_earned) || 0,
        remainingDays: user.remaining_days || 0,
        referralCode: user.referral_code,
        status: user.status,
        deposits: []
      }
    })

  } catch (error: unknown) {
    console.error('Login error:', error)
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ 
      success: false, 
      message 
    }, { status: 500 })
  }
}
