'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'

// =============================================
// SHIBALAB MINING - PROFESSIONAL ADMIN PANEL
// =============================================

// Admin Credentials
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'shiba@2024'

// Chart Colors
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  cyan: '#06b6d4',
  pink: '#ec4899',
  amber: '#f59e0b',
}

// =============================================
// TYPE DEFINITIONS
// =============================================

type User = {
  id: string
  username: string
  email: string
  walletAddress: string
  balance: number
  totalDeposited: number
  totalWithdrawn: number
  totalProfit: number
  status: 'active' | 'banned'
  joinDate: string
  lastLogin?: string
}

type Deposit = {
  id: string
  userId: string
  username: string
  walletAddress: string
  amount: number
  currency: string
  txHash: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
  plan?: string
}

type Withdrawal = {
  id: string
  userId: string
  username: string
  walletAddress: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'sent'
  date: string
  txHash?: string
}

type MiningPlan = {
  id: string
  name: string
  minInvestment: number
  maxInvestment: number
  dailyProfitPercent: number
  totalReturnPercent: number
  duration: number
  status: 'active' | 'disabled'
  createdAt: string
}

type Investment = {
  id: string
  userId: string
  username: string
  planName: string
  amount: number
  dailyProfit: number
  totalProfit: number
  startDate: string
  endDate: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
}

type Broadcast = {
  id: string
  message: string
  status: 'active' | 'inactive'
  createdAt: string
}

type SupportTicket = {
  id: string
  userId: string
  username: string
  subject: string
  message: string
  reply?: string
  status: 'open' | 'replied' | 'closed'
  createdAt: string
}

type AdminLog = {
  id: string
  action: string
  details: string
  ip: string
  timestamp: string
}

type Notification = {
  id: string
  type: 'deposit' | 'withdrawal' | 'plan' | 'broadcast' | 'alert'
  message: string
  read: boolean
  timestamp: string
}

type PlatformSettings = {
  siteName: string
  logo: string
  depositWallet: string
  depositsEnabled: boolean
  withdrawalsEnabled: boolean
  minWithdrawal: number
  maxWithdrawal: number
  supportEmail: string
  maintenanceMode: boolean
}

// =============================================
// MOCK DATA
// =============================================

const mockUsers: User[] = [
  { id: 'USR001', username: 'miner_pro', email: 'miner1@email.com', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', balance: 1500000, totalDeposited: 5000000, totalWithdrawn: 2500000, totalProfit: 1500000, status: 'active', joinDate: '2026-01-15', lastLogin: '2026-03-07' },
  { id: 'USR002', username: 'crypto_king', email: 'king@email.com', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', balance: 3500000, totalDeposited: 10000000, totalWithdrawn: 5000000, totalProfit: 3000000, status: 'active', joinDate: '2026-02-01', lastLogin: '2026-03-07' },
  { id: 'USR003', username: 'shiba_whale', email: 'whale@email.com', walletAddress: '0x9876543210fedcba9876543210fedcba98765432', balance: 0, totalDeposited: 2000000, totalWithdrawn: 2600000, totalProfit: 600000, status: 'banned', joinDate: '2026-01-20', lastLogin: '2026-02-28' },
  { id: 'USR004', username: 'diamond_hands', email: 'diamond@email.com', walletAddress: '0xfedcba0987654321fedcba0987654321fedcba09', balance: 5000000, totalDeposited: 15000000, totalWithdrawn: 8000000, totalProfit: 4500000, status: 'active', joinDate: '2026-01-10', lastLogin: '2026-03-07' },
  { id: 'USR005', username: 'moon_shot', email: 'moon@email.com', walletAddress: '0x5555666677778888999900001111222233334444', balance: 800000, totalDeposited: 2500000, totalWithdrawn: 1200000, totalProfit: 750000, status: 'active', joinDate: '2026-02-15', lastLogin: '2026-03-06' },
]

const mockDeposits: Deposit[] = [
  { id: 'DEP001', userId: 'USR001', username: 'miner_pro', walletAddress: '0x1234...5678', amount: 500000, currency: 'SHIB', txHash: '0xabc123def456789012345678901234567890abcd', status: 'approved', date: '2026-03-07 10:30:00', plan: 'Gold' },
  { id: 'DEP002', userId: 'USR002', username: 'crypto_king', walletAddress: '0xabcd...ef12', amount: 1000000, currency: 'SHIB', txHash: '0xdef456abc12345678901234567890abcd1234567', status: 'pending', date: '2026-03-07 11:45:00', plan: 'Diamond' },
  { id: 'DEP003', userId: 'USR004', username: 'diamond_hands', walletAddress: '0xfedc...ba09', amount: 250000, currency: 'SHIB', txHash: '0x789abc123def45678901234567890abcd12345ef', status: 'pending', date: '2026-03-07 12:15:00', plan: 'Bronze' },
  { id: 'DEP004', userId: 'USR005', username: 'moon_shot', walletAddress: '0x5555...4444', amount: 750000, currency: 'SHIB', txHash: '0x123def456abc78901234567890abcd12345678ab', status: 'approved', date: '2026-03-06 09:00:00', plan: 'Silver' },
  { id: 'DEP005', userId: 'USR001', username: 'miner_pro', walletAddress: '0x1234...5678', amount: 150000, currency: 'SHIB', txHash: '', status: 'rejected', date: '2026-03-05 14:30:00', plan: 'Starter' },
]

const mockWithdrawals: Withdrawal[] = [
  { id: 'WTH001', userId: 'USR001', username: 'miner_pro', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', amount: 250000, status: 'pending', date: '2026-03-07 09:00:00' },
  { id: 'WTH002', userId: 'USR002', username: 'crypto_king', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 500000, status: 'approved', date: '2026-03-07 10:30:00' },
  { id: 'WTH003', userId: 'USR004', username: 'diamond_hands', walletAddress: '0xfedcba0987654321fedcba0987654321fedcba09', amount: 100000, status: 'sent', date: '2026-03-06 15:00:00', txHash: '0xsent123txhash45678901234567890123456789ab' },
  { id: 'WTH004', userId: 'USR005', username: 'moon_shot', walletAddress: '0x5555666677778888999900001111222233334444', amount: 75000, status: 'pending', date: '2026-03-07 11:00:00' },
  { id: 'WTH005', userId: 'USR001', username: 'miner_pro', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', amount: 50000, status: 'rejected', date: '2026-03-05 16:45:00' },
]

const mockPlans: MiningPlan[] = [
  { id: 'PLAN001', name: 'Starter', minInvestment: 100000, maxInvestment: 249999, dailyProfitPercent: 3.33, totalReturnPercent: 130, duration: 30, status: 'active', createdAt: '2026-01-01' },
  { id: 'PLAN002', name: 'Bronze', minInvestment: 250000, maxInvestment: 499999, dailyProfitPercent: 3.33, totalReturnPercent: 130, duration: 30, status: 'active', createdAt: '2026-01-01' },
  { id: 'PLAN003', name: 'Silver', minInvestment: 500000, maxInvestment: 999999, dailyProfitPercent: 3.33, totalReturnPercent: 130, duration: 30, status: 'active', createdAt: '2026-01-01' },
  { id: 'PLAN004', name: 'Gold', minInvestment: 1000000, maxInvestment: 2499999, dailyProfitPercent: 3.33, totalReturnPercent: 130, duration: 30, status: 'active', createdAt: '2026-01-01' },
  { id: 'PLAN005', name: 'Platinum', minInvestment: 2500000, maxInvestment: 4999999, dailyProfitPercent: 3.33, totalReturnPercent: 130, duration: 30, status: 'active', createdAt: '2026-01-01' },
  { id: 'PLAN006', name: 'Diamond', minInvestment: 5000000, maxInvestment: 999999999, dailyProfitPercent: 3.33, totalReturnPercent: 130, duration: 30, status: 'active', createdAt: '2026-01-01' },
]

const mockInvestments: Investment[] = [
  { id: 'INV001', userId: 'USR001', username: 'miner_pro', planName: 'Gold', amount: 1000000, dailyProfit: 10000, totalProfit: 300000, startDate: '2026-03-01', endDate: '2026-03-31', status: 'active' },
  { id: 'INV002', userId: 'USR002', username: 'crypto_king', planName: 'Diamond', amount: 5000000, dailyProfit: 50000, totalProfit: 1500000, startDate: '2026-03-03', endDate: '2026-04-02', status: 'active' },
  { id: 'INV003', userId: 'USR004', username: 'diamond_hands', planName: 'Platinum', amount: 2500000, dailyProfit: 25000, totalProfit: 750000, startDate: '2026-02-28', endDate: '2026-03-30', status: 'paused' },
  { id: 'INV004', userId: 'USR005', username: 'moon_shot', planName: 'Silver', amount: 500000, dailyProfit: 5000, totalProfit: 150000, startDate: '2026-02-15', endDate: '2026-03-17', status: 'completed' },
  { id: 'INV005', userId: 'USR001', username: 'miner_pro', planName: 'Bronze', amount: 250000, dailyProfit: 2500, totalProfit: 75000, startDate: '2026-02-20', endDate: '2026-03-22', status: 'cancelled' },
]

const mockBroadcasts: Broadcast[] = [
  { id: 'BC001', message: '🚀 New Diamond Package Launched! Earn 130% ROI in 30 Days!', status: 'active', createdAt: '2026-03-07 10:00:00' },
  { id: 'BC002', message: '⚠️ Scheduled Maintenance on March 10th, 2026 at 2:00 AM UTC', status: 'active', createdAt: '2026-03-06 15:30:00' },
  { id: 'BC003', message: '🎉 Welcome Bonus: Deposit 1M+ SHIB and get priority withdrawal processing!', status: 'inactive', createdAt: '2026-03-05 09:00:00' },
]

const mockTickets: SupportTicket[] = [
  { id: 'TKT001', userId: 'USR001', username: 'miner_pro', subject: 'Withdrawal Pending for 24 Hours', message: 'My withdrawal request #WTH001 is pending for more than 24 hours. Please check and process it.', status: 'open', createdAt: '2026-03-07 08:30:00' },
  { id: 'TKT002', userId: 'USR002', username: 'crypto_king', subject: 'Balance Not Updated After Deposit', message: 'I deposited 500K SHIB 2 hours ago but my balance is still showing old amount. TX Hash: 0xabc123...', reply: 'We have verified your deposit and credited your balance. Please refresh the page to see updated amount.', status: 'replied', createdAt: '2026-03-06 14:00:00' },
  { id: 'TKT003', userId: 'USR005', username: 'moon_shot', subject: 'Question About Daily Profit', message: 'How is daily profit calculated? Is it automatically credited to my balance?', reply: 'Yes, daily profits are automatically credited to your balance every 24 hours from the time of deposit activation.', status: 'closed', createdAt: '2026-03-05 10:15:00' },
]

const mockLogs: AdminLog[] = [
  { id: 'LOG001', action: 'LOGIN', details: 'Admin logged in successfully', ip: '192.168.1.100', timestamp: '2026-03-07 10:00:00' },
  { id: 'LOG002', action: 'APPROVE_DEPOSIT', details: 'Approved deposit #DEP001 for 500,000 SHIB from user miner_pro', ip: '192.168.1.100', timestamp: '2026-03-07 10:05:00' },
  { id: 'LOG003', action: 'UPDATE_PLAN', details: 'Updated Gold plan - increased daily profit to 3.5%', ip: '192.168.1.100', timestamp: '2026-03-07 10:10:00' },
  { id: 'LOG004', action: 'BAN_USER', details: 'Banned user shiba_whale (USR003) for suspicious activity', ip: '192.168.1.100', timestamp: '2026-03-07 10:15:00' },
  { id: 'LOG005', action: 'SEND_BROADCAST', details: 'Sent broadcast: "New Diamond Package Launched!"', ip: '192.168.1.100', timestamp: '2026-03-07 10:20:00' },
  { id: 'LOG006', action: 'APPROVE_WITHDRAWAL', details: 'Approved withdrawal #WTH002 for 500,000 SHIB', ip: '192.168.1.100', timestamp: '2026-03-07 10:25:00' },
  { id: 'LOG007', action: 'SUSPICIOUS_LOGIN', details: 'Multiple failed login attempts detected from IP 203.45.67.89', ip: '203.45.67.89', timestamp: '2026-03-07 09:45:00' },
]

const mockNotifications: Notification[] = [
  { id: 'NOT001', type: 'deposit', message: 'New deposit of 1,000,000 SHIB pending approval', read: false, timestamp: '2026-03-07 11:45:00' },
  { id: 'NOT002', type: 'withdrawal', message: 'Withdrawal #WTH003 marked as sent', read: false, timestamp: '2026-03-07 11:00:00' },
  { id: 'NOT003', type: 'alert', message: 'Suspicious login attempt blocked from IP 203.45.67.89', read: false, timestamp: '2026-03-07 09:45:00' },
  { id: 'NOT004', type: 'broadcast', message: 'Broadcast message sent successfully', read: true, timestamp: '2026-03-07 10:20:00' },
]

const initialSettings: PlatformSettings = {
  siteName: 'ShibaLab Mining',
  logo: '/shiba-coin.png',
  depositWallet: '0x33cb374635ab51fc669c1849b21b589a17475fc3',
  depositsEnabled: true,
  withdrawalsEnabled: true,
  minWithdrawal: 50000,
  maxWithdrawal: 10000000,
  supportEmail: 'Shibalab.mining@gmail.com',
  maintenanceMode: false,
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K'
  return num.toLocaleString()
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString()
}

const checkAdminSession = (): boolean => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('shibalab_admin_session')
    if (session) {
      const data = JSON.parse(session)
      return Date.now() < data.expiresAt
    }
  }
  return false
}

// =============================================
// CHART DATA
// =============================================

const depositChartData = [
  { name: 'Mon', value: 4200000 },
  { name: 'Tue', value: 3800000 },
  { name: 'Wed', value: 5100000 },
  { name: 'Thu', value: 4500000 },
  { name: 'Fri', value: 6200000 },
  { name: 'Sat', value: 5800000 },
  { name: 'Sun', value: 4900000 },
]

const withdrawalChartData = [
  { name: 'Mon', value: 1200000 },
  { name: 'Tue', value: 1500000 },
  { name: 'Wed', value: 1100000 },
  { name: 'Thu', value: 1800000 },
  { name: 'Fri', value: 1600000 },
  { name: 'Sat', value: 1400000 },
  { name: 'Sun', value: 1300000 },
]

const userGrowthData = [
  { name: 'Jan', users: 1200 },
  { name: 'Feb', users: 3500 },
  { name: 'Mar', users: 6800 },
  { name: 'Apr', users: 10200 },
  { name: 'May', users: 14500 },
]

const packageDistribution = [
  { name: 'Starter', value: 3500, color: COLORS.cyan },
  { name: 'Bronze', value: 2800, color: COLORS.warning },
  { name: 'Silver', value: 2100, color: COLORS.secondary },
  { name: 'Gold', value: 1500, color: COLORS.amber },
  { name: 'Platinum', value: 800, color: COLORS.success },
  { name: 'Diamond', value: 500, color: COLORS.pink },
]

// =============================================
// MAIN ADMIN COMPONENT
// =============================================

export default function AdminPanel() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Navigation State
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Data States
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [deposits, setDeposits] = useState<Deposit[]>(mockDeposits)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals)
  const [plans, setPlans] = useState<MiningPlan[]>(mockPlans)
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(mockBroadcasts)
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [logs, setLogs] = useState<AdminLog[]>(mockLogs)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings)

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned'>('all')
  const [depositSearch, setDepositSearch] = useState('')
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'sent' | 'rejected'>('all')
  const [investmentFilter, setInvestmentFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'cancelled'>('all')
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('all')

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [showTxModal, setShowTxModal] = useState<string | null>(null)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  // Selected Items
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  // Form States
  const [txHashInput, setTxHashInput] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [ticketReply, setTicketReply] = useState('')
  const [planForm, setPlanForm] = useState({
    name: '',
    minInvestment: '',
    maxInvestment: '',
    dailyProfitPercent: '3.33',
    totalReturnPercent: '130',
    duration: '30',
  })
  const [userForm, setUserForm] = useState({
    balance: '',
    status: 'active' as 'active' | 'banned',
  })

  // Check session on mount
  useEffect(() => {
    setIsLoggedIn(checkAdminSession())
  }, [])

  // Add log entry
  const addLog = (action: string, details: string) => {
    const newLog: AdminLog = {
      id: 'LOG' + Date.now(),
      action,
      details,
      ip: '192.168.1.100',
      timestamp: new Date().toLocaleString(),
    }
    setLogs(prev => [newLog, ...prev])
  }

  // Add notification
  const addNotification = (type: Notification['type'], message: string) => {
    const newNotif: Notification = {
      id: 'NOT' + Date.now(),
      type,
      message,
      read: false,
      timestamp: new Date().toLocaleString(),
    }
    setNotifications(prev => [newNotif, ...prev])
  }

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      localStorage.setItem('shibalab_admin_session', JSON.stringify({
        loggedIn: true,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      }))
      addLog('LOGIN', 'Admin logged in successfully')
    } else {
      setLoginError('Invalid username or password')
      addLog('FAILED_LOGIN', `Failed login attempt with username: ${username}`)
    }
  }

  // Logout Handler
  const handleLogout = () => {
    addLog('LOGOUT', 'Admin logged out')
    setIsLoggedIn(false)
    localStorage.removeItem('shibalab_admin_session')
  }

  // =============================================
  // USER MANAGEMENT FUNCTIONS
  // =============================================

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.walletAddress.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.id.toLowerCase().includes(userSearch.toLowerCase())
    const matchesFilter = userFilter === 'all' || user.status === userFilter
    return matchesSearch && matchesFilter
  })

  const handleUpdateUserBalance = () => {
    if (selectedUser) {
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, balance: parseFloat(userForm.balance) || 0 } : u
      ))
      addLog('UPDATE_BALANCE', `Updated balance for user ${selectedUser.username} to ${userForm.balance} SHIB`)
      addNotification('deposit', `Balance updated for user ${selectedUser.username}`)
      setShowUserModal(false)
      setSelectedUser(null)
    }
  }

  const handleBanUser = (user: User) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active'
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    addLog('BAN_USER', `${newStatus === 'banned' ? 'Banned' : 'Unbanned'} user ${user.username} (${user.id})`)
    addNotification('alert', `User ${user.username} has been ${newStatus === 'banned' ? 'banned' : 'unbanned'}`)
  }

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
      addLog('DELETE_USER', `Deleted user ${user.username} (${user.id})`)
    }
  }

  const handleResetPassword = (user: User) => {
    if (confirm(`Reset password for user ${user.username}?`)) {
      addLog('RESET_PASSWORD', `Reset password for user ${user.username} (${user.id})`)
      alert(`Password reset link sent to ${user.email}`)
    }
  }

  // =============================================
  // DEPOSIT MANAGEMENT FUNCTIONS
  // =============================================

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = 
      deposit.id.toLowerCase().includes(depositSearch.toLowerCase()) ||
      deposit.username.toLowerCase().includes(depositSearch.toLowerCase()) ||
      deposit.txHash.toLowerCase().includes(depositSearch.toLowerCase())
    const matchesFilter = depositFilter === 'all' || deposit.status === depositFilter
    return matchesSearch && matchesFilter
  })

  const handleApproveDeposit = (deposit: Deposit) => {
    setDeposits(prev => prev.map(d => d.id === deposit.id ? { ...d, status: 'approved' } : d))
    addLog('APPROVE_DEPOSIT', `Approved deposit #${deposit.id} for ${formatNumber(deposit.amount)} SHIB from user ${deposit.username}`)
    addNotification('deposit', `Deposit #${deposit.id} approved - ${formatNumber(deposit.amount)} SHIB`)
  }

  const handleRejectDeposit = (deposit: Deposit) => {
    if (confirm('Are you sure you want to reject this deposit?')) {
      setDeposits(prev => prev.map(d => d.id === deposit.id ? { ...d, status: 'rejected' } : d))
      addLog('REJECT_DEPOSIT', `Rejected deposit #${deposit.id} for ${formatNumber(deposit.amount)} SHIB from user ${deposit.username}`)
    }
  }

  // =============================================
  // WITHDRAWAL MANAGEMENT FUNCTIONS
  // =============================================

  const filteredWithdrawals = withdrawals.filter(w => withdrawalFilter === 'all' || w.status === withdrawalFilter)

  const handleApproveWithdrawal = (w: Withdrawal) => {
    setWithdrawals(prev => prev.map(item => item.id === w.id ? { ...item, status: 'approved' } : item))
    addLog('APPROVE_WITHDRAWAL', `Approved withdrawal #${w.id} for ${formatNumber(w.amount)} SHIB`)
    addNotification('withdrawal', `Withdrawal #${w.id} approved - ${formatNumber(w.amount)} SHIB`)
  }

  const handleRejectWithdrawal = (w: Withdrawal) => {
    if (confirm('Are you sure you want to reject this withdrawal?')) {
      setWithdrawals(prev => prev.map(item => item.id === w.id ? { ...item, status: 'rejected' } : item))
      addLog('REJECT_WITHDRAWAL', `Rejected withdrawal #${w.id} for ${formatNumber(w.amount)} SHIB`)
    }
  }

  const handleMarkSent = () => {
    if (showTxModal && txHashInput) {
      setWithdrawals(prev => prev.map(w => w.id === showTxModal ? { ...w, status: 'sent', txHash: txHashInput } : w))
      addLog('MARK_SENT', `Marked withdrawal #${showTxModal} as sent. TX: ${txHashInput}`)
      addNotification('withdrawal', `Withdrawal #${showTxModal} sent - TX Hash recorded`)
      setShowTxModal(null)
      setTxHashInput('')
    }
  }

  // =============================================
  // MINING PLANS FUNCTIONS
  // =============================================

  const handleSavePlan = () => {
    if (selectedPlan) {
      // Edit existing plan
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? {
        ...p,
        name: planForm.name,
        minInvestment: parseFloat(planForm.minInvestment) || 0,
        maxInvestment: parseFloat(planForm.maxInvestment) || 0,
        dailyProfitPercent: parseFloat(planForm.dailyProfitPercent) || 0,
        totalReturnPercent: parseFloat(planForm.totalReturnPercent) || 0,
        duration: parseInt(planForm.duration) || 30,
      } : p))
      addLog('UPDATE_PLAN', `Updated mining plan: ${planForm.name}`)
      addNotification('plan', `Mining plan "${planForm.name}" updated`)
    } else {
      // Add new plan
      const newPlan: MiningPlan = {
        id: 'PLAN' + Date.now(),
        name: planForm.name,
        minInvestment: parseFloat(planForm.minInvestment) || 0,
        maxInvestment: parseFloat(planForm.maxInvestment) || 0,
        dailyProfitPercent: parseFloat(planForm.dailyProfitPercent) || 0,
        totalReturnPercent: parseFloat(planForm.totalReturnPercent) || 0,
        duration: parseInt(planForm.duration) || 30,
        status: 'active',
        createdAt: new Date().toLocaleString(),
      }
      setPlans(prev => [...prev, newPlan])
      addLog('ADD_PLAN', `Added new mining plan: ${planForm.name}`)
      addNotification('plan', `New mining plan "${planForm.name}" added`)
    }
    setShowPlanModal(false)
    setSelectedPlan(null)
    setPlanForm({ name: '', minInvestment: '', maxInvestment: '', dailyProfitPercent: '3.33', totalReturnPercent: '130', duration: '30' })
  }

  const handleTogglePlan = (plan: MiningPlan) => {
    const newStatus = plan.status === 'active' ? 'disabled' : 'active'
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: newStatus } : p))
    addLog('TOGGLE_PLAN', `${newStatus === 'active' ? 'Enabled' : 'Disabled'} mining plan: ${plan.name}`)
    addNotification('plan', `Plan "${plan.name}" ${newStatus === 'active' ? 'enabled' : 'disabled'}`)
  }

  const handleDeletePlan = (plan: MiningPlan) => {
    if (confirm(`Delete plan "${plan.name}"?`)) {
      setPlans(prev => prev.filter(p => p.id !== plan.id))
      addLog('DELETE_PLAN', `Deleted mining plan: ${plan.name}`)
    }
  }

  const openEditPlanModal = (plan: MiningPlan) => {
    setSelectedPlan(plan)
    setPlanForm({
      name: plan.name,
      minInvestment: plan.minInvestment.toString(),
      maxInvestment: plan.maxInvestment.toString(),
      dailyProfitPercent: plan.dailyProfitPercent.toString(),
      totalReturnPercent: plan.totalReturnPercent.toString(),
      duration: plan.duration.toString(),
    })
    setShowPlanModal(true)
  }

  const openAddPlanModal = () => {
    setSelectedPlan(null)
    setPlanForm({ name: '', minInvestment: '', maxInvestment: '', dailyProfitPercent: '3.33', totalReturnPercent: '130', duration: '30' })
    setShowPlanModal(true)
  }

  // =============================================
  // INVESTMENT MANAGEMENT FUNCTIONS
  // =============================================

  const filteredInvestments = investments.filter(inv => investmentFilter === 'all' || inv.status === investmentFilter)

  const handlePauseInvestment = (inv: Investment) => {
    const newStatus = inv.status === 'active' ? 'paused' : 'active'
    setInvestments(prev => prev.map(i => i.id === inv.id ? { ...i, status: newStatus } : i))
    addLog('PAUSE_INVESTMENT', `${newStatus === 'paused' ? 'Paused' : 'Resumed'} investment #${inv.id}`)
  }

  const handleCancelInvestment = (inv: Investment) => {
    if (confirm('Cancel this investment?')) {
      setInvestments(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'cancelled' } : i))
      addLog('CANCEL_INVESTMENT', `Cancelled investment #${inv.id}`)
    }
  }

  // =============================================
  // BROADCAST FUNCTIONS
  // =============================================

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      const newBroadcast: Broadcast = {
        id: 'BC' + Date.now(),
        message: broadcastMessage.trim(),
        status: 'active',
        createdAt: new Date().toLocaleString(),
      }
      setBroadcasts(prev => [newBroadcast, ...prev])
      addLog('SEND_BROADCAST', `Sent broadcast: "${broadcastMessage.substring(0, 50)}..."`)
      addNotification('broadcast', 'Broadcast message sent successfully')
      setBroadcastMessage('')
      setShowBroadcastModal(false)
    }
  }

  const handleToggleBroadcast = (bc: Broadcast) => {
    const newStatus = bc.status === 'active' ? 'inactive' : 'active'
    setBroadcasts(prev => prev.map(b => b.id === bc.id ? { ...b, status: newStatus } : b))
    addLog('TOGGLE_BROADCAST', `${newStatus === 'active' ? 'Activated' : 'Deactivated'} broadcast #${bc.id}`)
  }

  const handleDeleteBroadcast = (bc: Broadcast) => {
    if (confirm('Delete this broadcast?')) {
      setBroadcasts(prev => prev.filter(b => b.id !== bc.id))
      addLog('DELETE_BROADCAST', `Deleted broadcast #${bc.id}`)
    }
  }

  // =============================================
  // SUPPORT TICKET FUNCTIONS
  // =============================================

  const filteredTickets = tickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter)

  const handleReplyTicket = () => {
    if (selectedTicket && ticketReply.trim()) {
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, reply: ticketReply.trim(), status: 'replied' } : t))
      addLog('REPLY_TICKET', `Replied to ticket #${selectedTicket.id}`)
      setTicketReply('')
      setSelectedTicket(null)
    }
  }

  const handleCloseTicket = (ticket: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'closed' } : t))
    addLog('CLOSE_TICKET', `Closed ticket #${ticket.id}`)
  }

  // =============================================
  // SETTINGS FUNCTIONS
  // =============================================

  const handleSaveSettings = () => {
    addLog('UPDATE_SETTINGS', 'Platform settings updated')
    alert('Settings saved successfully!')
  }

  // Mark notification as read
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // =============================================
  // LOGIN PAGE
  // =============================================

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                ⛏️
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">ShibaLab Admin</h1>
              <p className="text-gray-400">Secure Admin Panel</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/30"
              >
                🔐 Login to Admin Panel
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
              <p className="text-gray-500 text-xs">🔒 Protected by 256-bit encryption</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =============================================
  // MAIN ADMIN DASHBOARD
  // =============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900/95 border-r border-cyan-500/20 flex flex-col transition-all duration-300 sticky top-0 h-screen`}>
        {/* Logo */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30 shrink-0">
              ⛏️
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">ShibaLab</h1>
                <p className="text-xs text-cyan-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'Users' },
            { id: 'deposits', icon: '💰', label: 'Deposits' },
            { id: 'withdrawals', icon: '💸', label: 'Withdrawals' },
            { id: 'plans', icon: '📦', label: 'Mining Plans' },
            { id: 'investments', icon: '📈', label: 'Investments' },
            { id: 'broadcast', icon: '📢', label: 'Broadcast' },
            { id: 'tickets', icon: '🎫', label: 'Support Tickets' },
            { id: 'analytics', icon: '📉', label: 'Analytics' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
            { id: 'logs', icon: '📋', label: 'Admin Logs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-cyan-500/20 text-gray-400 hover:text-white transition-all"
        >
          {sidebarCollapsed ? '→' : '← Collapse'}
        </button>

        {/* Logout */}
        <div className="p-2 border-t border-cyan-500/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <span className="text-xl">🚪</span>
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeMenu === 'plans' ? 'Mining Plans' : activeMenu}</h1>
              <p className="text-gray-400 text-sm">ShibaLab Mining Platform Administration</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="w-10 h-10 bg-slate-800 border border-cyan-500/30 rounded-xl flex items-center justify-center text-xl hover:bg-slate-700 transition-all relative"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Panel */}
                {showNotificationPanel && (
                  <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-cyan-500/20">
                      <h3 className="font-bold text-white">Notifications</h3>
                    </div>
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-3 rounded-lg mb-1 cursor-pointer transition-all ${notif.read ? 'bg-slate-800/50' : 'bg-cyan-500/10 border border-cyan-500/30'}`}
                          >
                            <p className="text-sm text-white">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* System Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
              
              {/* Admin Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/30">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* ========== DASHBOARD ========== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: '👥', label: 'Total Users', value: users.length, color: 'cyan' },
                  { icon: '🟢', label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: 'green' },
                  { icon: '💰', label: 'Total Deposits', value: formatNumber(deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0)) + ' SHIB', color: 'blue' },
                  { icon: '💸', label: 'Total Withdrawals', value: formatNumber(withdrawals.filter(w => w.status === 'sent').reduce((sum, w) => sum + w.amount, 0)) + ' SHIB', color: 'purple' },
                  { icon: '⏳', label: 'Pending Withdrawals', value: withdrawals.filter(w => w.status === 'pending').length, color: 'amber' },
                  { icon: '📈', label: 'Active Investments', value: investments.filter(i => i.status === 'active').length, color: 'green' },
                  { icon: '🌐', label: 'Online Users', value: Math.floor(users.length * 0.7), color: 'cyan' },
                  { icon: '💎', label: 'Profit Distributed', value: formatNumber(investments.reduce((sum, i) => sum + i.totalProfit, 0)) + ' SHIB', color: 'pink' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-${stat.color}-500/30 rounded-xl p-4 hover:border-${stat.color}-500/60 transition-all`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Deposits Chart */}
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📊 Daily Deposits</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={depositChartData}>
                      <defs>
                        <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(v) => `${v/1000000}M`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px' }} formatter={(v: number) => [formatNumber(v) + ' SHIB', 'Deposits']} />
                      <Area type="monotone" dataKey="value" stroke={COLORS.cyan} fill="url(#depositGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Withdrawals Chart */}
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">💸 Daily Withdrawals</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={withdrawalChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(v) => `${v/1000000}M`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #f59e0b', borderRadius: '8px' }} formatter={(v: number) => [formatNumber(v) + ' SHIB', 'Withdrawals']} />
                      <Bar dataKey="value" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Growth & Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📈 User Growth</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="users" stroke={COLORS.secondary} strokeWidth={3} dot={{ fill: COLORS.secondary, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📦 Package Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={packageDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {packageDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {packageDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-400 text-xs">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== USERS ========== */}
          {activeMenu === 'users' && (
            <div className="space-y-6">
              {/* Search & Filter */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Search by ID, Username, Email, or Wallet..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="flex-1 min-w-[250px] px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-2">
                    {(['all', 'active', 'banned'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setUserFilter(f)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${userFilter === f ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'}`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">User ID</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Username</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Email</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Wallet Address</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Balance</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Join Date</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-cyan-400 font-mono text-sm">{user.id}</td>
                          <td className="px-6 py-4 text-white font-medium">{user.username}</td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                          <td className="px-6 py-4 text-gray-300 font-mono text-sm">{user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-6)}</td>
                          <td className="px-6 py-4 text-green-400 font-bold">{formatNumber(user.balance)} SHIB</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{user.joinDate}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setSelectedUser(user); setUserForm({ balance: user.balance.toString(), status: user.status }); setShowUserModal(true) }}
                                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleBanUser(user)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${user.status === 'active' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}
                              >
                                {user.status === 'active' ? 'Ban' : 'Unban'}
                              </button>
                              <button
                                onClick={() => handleResetPassword(user)}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-all"
                              >
                                Reset
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== DEPOSITS ========== */}
          {activeMenu === 'deposits' && (
            <div className="space-y-6">
              {/* Search & Filter */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Search by ID, Username, or TX Hash..."
                    value={depositSearch}
                    onChange={(e) => setDepositSearch(e.target.value)}
                    className="flex-1 min-w-[250px] px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setDepositFilter(f)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${depositFilter === f ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'}`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deposits Table */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">ID</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">User</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Amount</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Currency</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">TX Hash</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Plan</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Date</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeposits.map((deposit) => (
                        <tr key={deposit.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-cyan-400 font-mono text-sm">{deposit.id}</td>
                          <td className="px-6 py-4 text-white">{deposit.username}</td>
                          <td className="px-6 py-4 text-green-400 font-bold">{formatNumber(deposit.amount)} SHIB</td>
                          <td className="px-6 py-4 text-gray-300">{deposit.currency}</td>
                          <td className="px-6 py-4 text-gray-300 font-mono text-sm">{deposit.txHash ? `${deposit.txHash.slice(0, 10)}...${deposit.txHash.slice(-6)}` : 'N/A'}</td>
                          <td className="px-6 py-4 text-amber-400">{deposit.plan || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              deposit.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              deposit.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {deposit.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{deposit.date}</td>
                          <td className="px-6 py-4">
                            {deposit.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveDeposit(deposit)}
                                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleRejectDeposit(deposit)}
                                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== WITHDRAWALS ========== */}
          {activeMenu === 'withdrawals' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'approved', 'sent', 'rejected'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setWithdrawalFilter(f)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${withdrawalFilter === f ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdrawals Table */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">ID</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">User</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Amount</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Wallet Address</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">TX Hash</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Date</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((w) => (
                        <tr key={w.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-cyan-400 font-mono text-sm">{w.id}</td>
                          <td className="px-6 py-4 text-white">{w.username}</td>
                          <td className="px-6 py-4 text-amber-400 font-bold">{formatNumber(w.amount)} SHIB</td>
                          <td className="px-6 py-4 text-gray-300 font-mono text-sm">{w.walletAddress.slice(0, 10)}...{w.walletAddress.slice(-6)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              w.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              w.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                              w.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {w.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-mono text-sm">{w.txHash ? `${w.txHash.slice(0, 10)}...` : '-'}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{w.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {w.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApproveWithdrawal(w)} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all">Approve</button>
                                  <button onClick={() => handleRejectWithdrawal(w)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all">Reject</button>
                                </>
                              )}
                              {w.status === 'approved' && (
                                <button onClick={() => setShowTxModal(w.id)} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-all">Mark Sent</button>
                              )}
                              {w.status === 'sent' && (
                                <span className="text-green-400 text-sm">✓ Completed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== MINING PLANS ========== */}
          {activeMenu === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-400">Manage investment packages</p>
                <button
                  onClick={openAddPlanModal}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  ➕ Add New Plan
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className={`bg-slate-900/50 border rounded-xl p-6 ${plan.status === 'active' ? 'border-cyan-500/30' : 'border-red-500/30 opacity-60'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${plan.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-3xl">📦</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Min Investment:</span>
                        <span className="text-cyan-400 font-bold">{formatNumber(plan.minInvestment)} SHIB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max Investment:</span>
                        <span className="text-cyan-400 font-bold">{formatNumber(plan.maxInvestment)} SHIB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Daily Profit:</span>
                        <span className="text-green-400 font-bold">{plan.dailyProfitPercent}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Return:</span>
                        <span className="text-amber-400 font-bold">{plan.totalReturnPercent}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-bold">{plan.duration} Days</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                      <button onClick={() => openEditPlanModal(plan)} className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-all">Edit</button>
                      <button onClick={() => handleTogglePlan(plan)} className={`flex-1 py-2 rounded-lg text-sm transition-all ${plan.status === 'active' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                        {plan.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => handleDeletePlan(plan)} className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== INVESTMENTS ========== */}
          {activeMenu === 'investments' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'active', 'paused', 'completed', 'cancelled'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setInvestmentFilter(f)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${investmentFilter === f ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">ID</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">User</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Plan</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Amount</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Daily Profit</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Total Profit</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Start Date</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">End Date</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestments.map((inv) => (
                        <tr key={inv.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-cyan-400 font-mono text-sm">{inv.id}</td>
                          <td className="px-6 py-4 text-white">{inv.username}</td>
                          <td className="px-6 py-4 text-amber-400">{inv.planName}</td>
                          <td className="px-6 py-4 text-green-400 font-bold">{formatNumber(inv.amount)}</td>
                          <td className="px-6 py-4 text-purple-400">{formatNumber(inv.dailyProfit)}</td>
                          <td className="px-6 py-4 text-cyan-400">{formatNumber(inv.totalProfit)}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{inv.startDate}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{inv.endDate}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              inv.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              inv.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                              inv.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {inv.status === 'active' && (
                                <button onClick={() => handlePauseInvestment(inv)} className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-all">Pause</button>
                              )}
                              {inv.status === 'paused' && (
                                <button onClick={() => handlePauseInvestment(inv)} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all">Resume</button>
                              )}
                              {(inv.status === 'active' || inv.status === 'paused') && (
                                <button onClick={() => handleCancelInvestment(inv)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all">Cancel</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== BROADCAST ========== */}
          {activeMenu === 'broadcast' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-400">Send global announcements to all users</p>
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  📢 New Broadcast
                </button>
              </div>

              <div className="space-y-4">
                {broadcasts.map((bc) => (
                  <div key={bc.id} className={`bg-slate-900/50 border rounded-xl p-4 ${bc.status === 'active' ? 'border-cyan-500/30 border-l-4 border-l-cyan-500' : 'border-slate-700/50 opacity-60'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white text-lg">{bc.message}</p>
                        <p className="text-gray-400 text-sm mt-2">{bc.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${bc.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {bc.status.toUpperCase()}
                        </span>
                        <button onClick={() => handleToggleBroadcast(bc)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${bc.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                          {bc.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteBroadcast(bc)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== SUPPORT TICKETS ========== */}
          {activeMenu === 'tickets' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'open', 'replied', 'closed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTicketFilter(f)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${ticketFilter === f ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-1 bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                  <h3 className="text-lg font-bold text-white mb-4">All Tickets ({filteredTickets.length})</h3>
                  <div className="space-y-2">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-400 font-mono text-sm">#{ticket.id}</span>
                          <span className={`px-2 py-1 rounded text-xs ${ticket.status === 'open' ? 'bg-amber-500/20 text-amber-400' : ticket.status === 'replied' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white font-medium">{ticket.subject}</p>
                        <p className="text-gray-400 text-sm mt-1">From: {ticket.username}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Detail */}
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${selectedTicket.status === 'open' ? 'bg-amber-500/20 text-amber-400' : selectedTicket.status === 'replied' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {selectedTicket.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                          <p className="text-gray-400 text-sm mb-2">From: {selectedTicket.username} • {selectedTicket.createdAt}</p>
                          <p className="text-white">{selectedTicket.message}</p>
                        </div>
                        {selectedTicket.reply && (
                          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                            <p className="text-cyan-400 text-sm mb-2">Admin Reply:</p>
                            <p className="text-white">{selectedTicket.reply}</p>
                          </div>
                        )}
                      </div>
                      {selectedTicket.status !== 'closed' && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <textarea
                            value={ticketReply}
                            onChange={(e) => setTicketReply(e.target.value)}
                            placeholder="Type your reply..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none mb-3"
                          />
                          <div className="flex gap-3">
                            <button onClick={handleReplyTicket} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl">Send Reply</button>
                            <button onClick={() => handleCloseTicket(selectedTicket)} className="px-6 py-3 bg-green-500/20 text-green-400 rounded-xl">Close Ticket</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl h-[400px] flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-4">🎫</div>
                        <p>Select a ticket to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========== ANALYTICS ========== */}
          {activeMenu === 'analytics' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📊 Revenue Analytics</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={depositChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="value" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">📈 User Growth</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="users" stroke={COLORS.secondary} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Countries */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">🌍 User Distribution by Country</h3>
                <div className="space-y-4">
                  {[
                    { name: 'USA', users: 3200, percentage: 25 },
                    { name: 'UK', users: 1800, percentage: 14 },
                    { name: 'India', users: 5200, percentage: 41 },
                    { name: 'Dubai', users: 900, percentage: 7 },
                    { name: 'Others', users: 1700, percentage: 13 },
                  ].map((country) => (
                    <div key={country.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{country.name}</span>
                        <span className="text-gray-400">{country.users.toLocaleString()} users ({country.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${country.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== SETTINGS ========== */}
          {activeMenu === 'settings' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">⚙️ General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Website Name</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Wallet Settings */}
                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">💳 Wallet Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Deposit Wallet Address</label>
                      <input
                        type="text"
                        value={settings.depositWallet}
                        onChange={(e) => setSettings({ ...settings, depositWallet: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Min Withdrawal (SHIB)</label>
                        <input
                          type="number"
                          value={settings.minWithdrawal}
                          onChange={(e) => setSettings({ ...settings, minWithdrawal: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Max Withdrawal (SHIB)</label>
                        <input
                          type="number"
                          value={settings.maxWithdrawal}
                          onChange={(e) => setSettings({ ...settings, maxWithdrawal: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">🔧 Feature Toggles</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Deposits</p>
                        <p className="text-gray-400 text-sm">Allow users to make deposits</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, depositsEnabled: !settings.depositsEnabled })}
                        className={`w-14 h-7 rounded-full transition-all ${settings.depositsEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all ${settings.depositsEnabled ? 'translate-x-8' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Withdrawals</p>
                        <p className="text-gray-400 text-sm">Allow users to request withdrawals</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, withdrawalsEnabled: !settings.withdrawalsEnabled })}
                        className={`w-14 h-7 rounded-full transition-all ${settings.withdrawalsEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all ${settings.withdrawalsEnabled ? 'translate-x-8' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Maintenance Mode</p>
                        <p className="text-gray-400 text-sm">Show maintenance page to users</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`w-14 h-7 rounded-full transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'translate-x-8' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-red-400 mb-6">⚠️ Danger Zone</h3>
                  <div className="space-y-4">
                    <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all">
                      🗑️ Clear All Cache
                    </button>
                    <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all">
                      🔄 Reset Platform Stats
                    </button>
                    <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all">
                      ⚠️ Emergency Stop All Mining
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={handleSaveSettings} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition-all">
                💾 Save All Settings
              </button>
            </div>
          )}

          {/* ========== ADMIN LOGS ========== */}
          {activeMenu === 'logs' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Timestamp</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Action</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Details</th>
                        <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-gray-400 text-sm">{log.timestamp}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              log.action.includes('LOGIN') || log.action.includes('LOGOUT') ? 'bg-blue-500/20 text-blue-400' :
                              log.action.includes('APPROVE') ? 'bg-green-500/20 text-green-400' :
                              log.action.includes('REJECT') || log.action.includes('BAN') || log.action.includes('DELETE') || log.action.includes('CANCEL') ? 'bg-red-500/20 text-red-400' :
                              log.action.includes('SUSPICIOUS') ? 'bg-amber-500/20 text-amber-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white">{log.details}</td>
                          <td className="px-6 py-4 text-gray-400 font-mono text-sm">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========== MODALS ========== */}

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit User Balance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <p className="text-white font-medium">{selectedUser.username}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Wallet Address</label>
                <p className="text-cyan-400 font-mono text-sm">{selectedUser.walletAddress.slice(0, 15)}...</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Balance (SHIB)</label>
                <input
                  type="number"
                  value={userForm.balance}
                  onChange={(e) => setUserForm({ ...userForm, balance: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleUpdateUserBalance} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl">Save Changes</button>
                <button onClick={() => { setShowUserModal(false); setSelectedUser(null) }} className="flex-1 py-3 bg-slate-700/50 text-gray-300 rounded-xl">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-6">{selectedPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Plan Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g., Premium"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Min Investment (SHIB)</label>
                <input
                  type="number"
                  value={planForm.minInvestment}
                  onChange={(e) => setPlanForm({ ...planForm, minInvestment: e.target.value })}
                  placeholder="100000"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Max Investment (SHIB)</label>
                <input
                  type="number"
                  value={planForm.maxInvestment}
                  onChange={(e) => setPlanForm({ ...planForm, maxInvestment: e.target.value })}
                  placeholder="250000"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Daily Profit (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.dailyProfitPercent}
                  onChange={(e) => setPlanForm({ ...planForm, dailyProfitPercent: e.target.value })}
                  placeholder="3.33"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Total Return (%)</label>
                <input
                  type="number"
                  value={planForm.totalReturnPercent}
                  onChange={(e) => setPlanForm({ ...planForm, totalReturnPercent: e.target.value })}
                  placeholder="130"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Duration (Days)</label>
                <input
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                  placeholder="30"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSavePlan} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl">
                {selectedPlan ? 'Update Plan' : 'Add Plan'}
              </button>
              <button onClick={() => { setShowPlanModal(false); setSelectedPlan(null) }} className="flex-1 py-3 bg-slate-700/50 text-gray-300 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">📢 New Broadcast Message</h3>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter your announcement message..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleSendBroadcast} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl">Send Broadcast</button>
              <button onClick={() => { setShowBroadcastModal(false); setBroadcastMessage('') }} className="flex-1 py-3 bg-slate-700/50 text-gray-300 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TX Hash Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Enter Transaction Hash</h3>
            <input
              type="text"
              value={txHashInput}
              onChange={(e) => setTxHashInput(e.target.value)}
              placeholder="Paste TX hash here..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleMarkSent} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl">Confirm</button>
              <button onClick={() => { setShowTxModal(null); setTxHashInput('') }} className="flex-1 py-3 bg-slate-700/50 text-gray-300 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
