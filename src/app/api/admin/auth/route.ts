import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash, randomBytes } from 'crypto'

// Hash password
function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'shibalab_salt_2024').digest('hex')
}

// Generate session token
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// POST - Admin Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, action } = body

    // Create default admin (first time setup)
    if (action === 'setup') {
      const existingAdmin = await prisma.admin.findFirst()
      if (existingAdmin) {
        return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
      }

      const hashedPassword = hashPassword(password)
      const admin = await prisma.admin.create({
        data: {
          username,
          password: hashedPassword,
          email: `${username}@shibalab.admin`,
          role: 'superadmin'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
        admin: { id: admin.id, username: admin.username, role: admin.role }
      })
    }

    // Login
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const hashedPassword = hashPassword(password)
    const admin = await prisma.admin.findFirst({
      where: {
        username,
        password: hashedPassword,
        isActive: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate session token
    const token = generateToken()

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      token
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Check if admin exists
export async function GET() {
  try {
    const adminCount = await prisma.admin.count()
    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount
    })
  } catch (error) {
    console.error('Check admin error:', error)
    return NextResponse.json({ hasAdmin: false, adminCount: 0 })
  }
}
