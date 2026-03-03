'use client'

import { useState, useEffect, useCallback } from 'react'

// Default admin credentials - CHANGE THESE IN PRODUCTION!
const DEFAULT_ADMIN = {
  username: 'shibalab',
  password: 'Admin@2024!'
}

type Stats = {
  totalUsers: number
  pendingDeposits: number
  pendingWithdrawals: number
  totalInvested: number
  totalWithdrawn: number
  onlineUsers: number
  totalVisitors: number
  todayVisitors: number
}

type Deposit = {
  id: string
  amount: number
  packageId: number
  transactionHash: string
  status: string
  wallet: string
  createdAt: string
}

type Withdrawal = {
  id: string
  amount: number
  walletAddress: string
  status: string
  userWallet: string
  createdAt: string
}

type User = {
  id: string
  wallet: string
  balance: number
  totalInvested: number
  totalEarned: number
  referralCode: string
  isActive: boolean
  createdAt: string
}

const packages = [
  { id: 1, name: 'Starter', investment: 100000, totalReturn: 140000 },
  { id: 2, name: 'Bronze', investment: 250000, totalReturn: 350000 },
  { id: 3, name: 'Silver', investment: 500000, totalReturn: 700000 },
  { id: 4, name: 'Gold', investment: 1000000, totalReturn: 1400000 },
  { id: 5, name: 'Platinum', investment: 2500000, totalReturn: 3500000 },
  { id: 6, name: 'Diamond', investment: 5000000, totalReturn: 7000000 },
]

function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toLocaleString()
}

// Custom hook for fetching data
function useAdminData(isLoggedIn: boolean) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!isLoggedIn) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setDeposits(data.recent.deposits)
        setWithdrawals(data.recent.withdrawals)
        setUsers(data.recent.users)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      fetchData()
    }
  }, [isLoggedIn, fetchData])

  return { stats, deposits, withdrawals, users, loading, refetch: fetchData }
}

export default function AdminPanel() {
  // Initialize login state based on session
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'settings'>('dashboard')
  
  // Login form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  
  // Use custom hook for data
  const { stats, deposits, withdrawals, users, loading, refetch } = useAdminData(isLoggedIn)
  
  // Settings
  const platformWallet = '0x33cb374635ab51fc669c1849b21b589a17475fc3'
  const whatsappLink = 'https://chat.whatsapp.com/K7IQFq2iqcvLqLsXHDhRn8'

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem('admin_session')
    if (session === 'active') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true)
    }
  }, [])

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      sessionStorage.setItem('admin_session', 'active')
      setIsLoggedIn(true)
    } else {
      setLoginError('Invalid username or password')
    }
  }

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem('admin_session')
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  // Approve deposit
  const approveDeposit = async (depositId: string) => {
    try {
      const res = await fetch('/api/admin/deposit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action: 'approve' })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Deposit approved!')
        refetch()
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to approve deposit')
    }
  }

  // Reject deposit
  const rejectDeposit = async (depositId: string) => {
    if (!confirm('Are you sure you want to reject this deposit?')) return
    try {
      const res = await fetch('/api/admin/deposit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action: 'reject' })
      })
      const data = await res.json()
      if (data.success) {
        alert('❌ Deposit rejected')
        refetch()
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to reject deposit')
    }
  }

  // Approve withdrawal
  const approveWithdrawal = async (withdrawalId: string) => {
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action: 'approve' })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Withdrawal approved!')
        refetch()
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to approve withdrawal')
    }
  }

  // Reject withdrawal
  const rejectWithdrawal = async (withdrawalId: string) => {
    if (!confirm('Are you sure? Balance will be refunded to user.')) return
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action: 'reject' })
      })
      const data = await res.json()
      if (data.success) {
        alert('❌ Withdrawal rejected, balance refunded')
        refetch()
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to reject withdrawal')
    }
  }

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-purple-900/50 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-purple-600/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">🐕</div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">ShibaLab Mining Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white focus:outline-none focus:border-yellow-500"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white focus:outline-none focus:border-yellow-500"
                placeholder="Enter password"
                required
              />
            </div>
            
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg"
            >
              🔐 Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">Default: shibalab / Admin@2024!</p>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
      {/* Header */}
      <header className="bg-purple-950/95 backdrop-blur-md border-b border-purple-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg">🐕</div>
            <div>
              <h1 className="text-xl font-bold text-white">ShibaLab Admin</h1>
              <p className="text-gray-400 text-sm">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-400 text-sm flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-purple-900/50 border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'deposits', label: '💰 Deposits' },
              { id: 'withdrawals', label: '💸 Withdrawals' },
              { id: 'users', label: '👥 Users' },
              { id: 'settings', label: '⚙️ Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-2xl p-6 border border-purple-600/30">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-gray-400 text-sm">Total Users</p>
              </div>
              <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 rounded-2xl p-6 border border-green-600/30">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-3xl font-bold text-green-400">{formatNumber(stats.totalInvested)}</p>
                <p className="text-gray-400 text-sm">Total Invested</p>
              </div>
              <div className="bg-gradient-to-br from-red-800/50 to-red-900/50 rounded-2xl p-6 border border-red-600/30">
                <div className="text-3xl mb-2">💸</div>
                <p className="text-3xl font-bold text-red-400">{formatNumber(stats.totalWithdrawn)}</p>
                <p className="text-gray-400 text-sm">Total Withdrawn</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-800/50 to-yellow-900/50 rounded-2xl p-6 border border-yellow-600/30">
                <div className="text-3xl mb-2">🟢</div>
                <p className="text-3xl font-bold text-yellow-400">{stats.onlineUsers}</p>
                <p className="text-gray-400 text-sm">Online Now</p>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Deposits */}
              <div className="bg-purple-800/30 rounded-2xl p-6 border border-purple-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">⏳ Pending Deposits</h3>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">{stats.pendingDeposits}</span>
                </div>
                {deposits.filter(d => d.status === 'pending').length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No pending deposits</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {deposits.filter(d => d.status === 'pending').slice(0, 5).map((d) => (
                      <div key={d.id} className="bg-purple-900/50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-bold">{formatNumber(d.amount)} SHIB</p>
                            <p className="text-gray-400 text-xs font-mono">{d.wallet.slice(0, 8)}...{d.wallet.slice(-6)}</p>
                          </div>
                          <span className="text-xs text-yellow-400">Pkg #{d.packageId}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => approveDeposit(d.id)}
                            disabled={loading}
                            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => rejectDeposit(d.id)}
                            disabled={loading}
                            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Withdrawals */}
              <div className="bg-purple-800/30 rounded-2xl p-6 border border-purple-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">⏳ Pending Withdrawals</h3>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">{stats.pendingWithdrawals}</span>
                </div>
                {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No pending withdrawals</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {withdrawals.filter(w => w.status === 'pending').slice(0, 5).map((w) => (
                      <div key={w.id} className="bg-purple-900/50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-bold">{formatNumber(w.amount)} SHIB</p>
                            <p className="text-gray-400 text-xs font-mono">To: {w.walletAddress.slice(0, 8)}...{w.walletAddress.slice(-6)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => approveWithdrawal(w.id)}
                            disabled={loading}
                            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(w.id)}
                            disabled={loading}
                            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visitor Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-800/30 rounded-2xl p-6 border border-purple-600/30">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🌍</div>
                  <div>
                    <p className="text-3xl font-bold text-white">{formatNumber(stats.totalVisitors)}</p>
                    <p className="text-gray-400">Total Visitors</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-800/30 rounded-2xl p-6 border border-purple-600/30">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">📅</div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.todayVisitors}</p>
                    <p className="text-gray-400">Today Visitors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="bg-purple-800/30 rounded-2xl border border-purple-600/30 overflow-hidden">
            <div className="bg-purple-800/50 px-6 py-4 border-b border-purple-600/30">
              <h3 className="text-lg font-bold text-white">💰 All Deposits</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Wallet</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Amount</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Pkg</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Status</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Date</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id} className="border-b border-purple-700/30 hover:bg-purple-700/10">
                      <td className="px-4 py-3 text-white font-mono text-xs">{d.wallet.slice(0, 8)}...{d.wallet.slice(-6)}</td>
                      <td className="px-4 py-3 text-white font-bold">{formatNumber(d.amount)}</td>
                      <td className="px-4 py-3 text-yellow-400">#{d.packageId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          d.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          d.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {d.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approveDeposit(d.id)} className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs">✓</button>
                            <button onClick={() => rejectDeposit(d.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs">✗</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-purple-800/30 rounded-2xl border border-purple-600/30 overflow-hidden">
            <div className="bg-purple-800/50 px-6 py-4 border-b border-purple-600/30">
              <h3 className="text-lg font-bold text-white">💸 All Withdrawals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">User</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Amount</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">To</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Status</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Date</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-purple-700/30 hover:bg-purple-700/10">
                      <td className="px-4 py-3 text-white font-mono text-xs">{w.userWallet.slice(0, 8)}...{w.userWallet.slice(-6)}</td>
                      <td className="px-4 py-3 text-white font-bold">{formatNumber(w.amount)}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{w.walletAddress.slice(0, 8)}...{w.walletAddress.slice(-6)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          w.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approveWithdrawal(w.id)} className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs">✓</button>
                            <button onClick={() => rejectWithdrawal(w.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs">✗</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-purple-800/30 rounded-2xl border border-purple-600/30 overflow-hidden">
            <div className="bg-purple-800/50 px-6 py-4 border-b border-purple-600/30">
              <h3 className="text-lg font-bold text-white">👥 All Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Wallet</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Balance</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Invested</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Earned</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Ref Code</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-purple-700/30 hover:bg-purple-700/10">
                      <td className="px-4 py-3 text-white font-mono text-xs">{u.wallet.slice(0, 8)}...{u.wallet.slice(-6)}</td>
                      <td className="px-4 py-3 text-green-400 font-bold">{formatNumber(u.balance)}</td>
                      <td className="px-4 py-3 text-yellow-400">{formatNumber(u.totalInvested)}</td>
                      <td className="px-4 py-3 text-blue-400">{formatNumber(u.totalEarned)}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.referralCode}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-purple-800/30 rounded-2xl p-6 border border-purple-600/30">
              <h3 className="text-lg font-bold text-white mb-6">⚙️ Platform Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Platform Wallet Address</label>
                  <input
                    type="text"
                    value={platformWallet}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">WhatsApp Support Link</label>
                  <input
                    type="text"
                    value={whatsappLink}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <h4 className="text-yellow-400 font-medium mb-2">📌 Packages Configuration</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left py-2">Package</th>
                        <th className="text-left py-2">Investment</th>
                        <th className="text-left py-2">Total Return</th>
                        <th className="text-left py-2">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((p) => (
                        <tr key={p.id} className="text-white">
                          <td className="py-2">{p.name}</td>
                          <td className="py-2">{formatNumber(p.investment)}</td>
                          <td className="py-2 text-yellow-400">{formatNumber(p.totalReturn)}</td>
                          <td className="py-2 text-green-400">+{formatNumber(p.totalReturn - p.investment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Admin Credentials */}
            <div className="bg-red-800/20 border border-red-600/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-red-400 mb-4">🔐 Admin Credentials</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-black/20 rounded-xl p-4">
                  <p className="text-gray-400 mb-1">Username</p>
                  <p className="text-white font-mono">shibalab</p>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                  <p className="text-gray-400 mb-1">Password</p>
                  <p className="text-white font-mono">Admin@2024!</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4">⚠️ Change these credentials in production!</p>
            </div>
          </div>
        )}
      </main>

      {/* Refresh Button */}
      <button
        onClick={refetch}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
        title="Refresh Data"
      >
        🔄
      </button>
    </div>
  )
}
