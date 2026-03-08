import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch chat messages for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const wallet = searchParams.get('wallet')
    const admin = searchParams.get('admin')

    // If admin=true, get all conversations (for admin panel)
    if (admin === 'true') {
      const { data, error } = await db.supabaseAdmin
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500)

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
      }

      // Group messages by user
      const conversations: Record<string, any[]> = {}
      data?.forEach((msg: any) => {
        if (!conversations[msg.user_id]) {
          conversations[msg.user_id] = []
        }
        conversations[msg.user_id].push(msg)
      })

      // Get user info for each conversation
      const conversationList = await Promise.all(
        Object.entries(conversations).map(async ([userId, messages]) => {
          const user = await db.getUserById(userId)
          const unreadCount = messages.filter((m: any) => !m.is_read && m.is_admin === false).length
          return {
            userId,
            wallet: user?.wallet_address || 'Unknown',
            messages,
            lastMessage: messages[messages.length - 1],
            unreadCount,
          }
        })
      )

      // Sort by last message time
      conversationList.sort((a, b) => 
        new Date(b.lastMessage?.created_at || 0).getTime() - 
        new Date(a.lastMessage?.created_at || 0).getTime()
      )

      return NextResponse.json({ success: true, conversations: conversationList })
    }

    // Regular user fetching their messages
    if (!wallet) {
      return NextResponse.json({ success: false, message: 'Wallet address required' }, { status: 400 })
    }

    const user = await db.getUser(wallet)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const { data, error } = await db.supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    // Mark user's unread admin messages as read
    await db.supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_admin', true)
      .eq('is_read', false)

    return NextResponse.json({ success: true, messages: data || [] })
  } catch (error: any) {
    console.error('Chat GET error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, message, isAdmin, adminWallet, userId } = body

    // Admin sending message
    if (isAdmin && userId) {
      const { data, error } = await db.supabaseAdmin
        .from('chat_messages')
        .insert({
          user_id: userId,
          message,
          sender: adminWallet || 'Admin',
          is_admin: true,
          is_read: false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: data })
    }

    // User sending message
    if (!wallet || !message) {
      return NextResponse.json({ success: false, message: 'Wallet and message required' }, { status: 400 })
    }

    const user = await db.getUser(wallet)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const { data, error } = await db.supabaseAdmin
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message,
        sender: wallet,
        is_admin: false,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (error: any) {
    console.error('Chat POST error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// PUT: Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, markAllRead } = body

    if (markAllRead && userId) {
      const { error } = await db.supabaseAdmin
        .from('chat_messages')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_admin', false)
        .eq('is_read', false)

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    console.error('Chat PUT error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
