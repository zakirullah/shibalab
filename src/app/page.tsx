'use client'

import { useState, useEffect, useRef } from 'react'

// Platform Configuration
const PLATFORM_WALLET = '0x33cb374635ab51fc669c1849b21b589a17475fc3'
const WHATSAPP_LINK = 'https://chat.whatsapp.com/K7IQFq2iqcvLqLsXHDhRn8'

// Mining Packages
const miningPackages = [
  { id: 1, name: 'Starter', deposit: 100000, totalReturn: 140000, profit: 40000, dh_s: 2, duration: 30, color: 'from-gray-500 to-gray-600', popular: false },
  { id: 2, name: 'Bronze', deposit: 250000, totalReturn: 350000, profit: 100000, dh_s: 5, duration: 30, color: 'from-orange-600 to-orange-700', popular: false },
  { id: 3, name: 'Silver', deposit: 500000, totalReturn: 700000, profit: 200000, dh_s: 10, duration: 30, color: 'from-slate-400 to-slate-500', popular: false },
  { id: 4, name: 'Gold', deposit: 1000000, totalReturn: 1400000, profit: 400000, dh_s: 20, duration: 30, color: 'from-yellow-500 to-amber-600', popular: true },
  { id: 5, name: 'Platinum', deposit: 2500000, totalReturn: 3500000, profit: 1000000, dh_s: 50, duration: 30, color: 'from-cyan-400 to-cyan-600', popular: false },
  { id: 6, name: 'Diamond', deposit: 5000000, totalReturn: 7000000, profit: 2000000, dh_s: 100, duration: 30, color: 'from-blue-400 to-purple-600', popular: false },
]

// Testimonials
const testimonials = [
  { name: 'Ahmad K.', country: 'Pakistan', investment: 'Gold Package', profit: '+400,000 SHIB', avatar: '👨‍💼', text: 'Masha Allah! 30 days mein 40% profit mila. Best platform hai!' },
  { name: 'Sarah M.', country: 'UAE', investment: 'Diamond Package', profit: '+2,000,000 SHIB', avatar: '👩‍💼', text: 'Very professional platform. Withdrawal within 24 hours!' },
  { name: 'Usman A.', country: 'Saudi Arabia', investment: 'Platinum Package', profit: '+1,000,000 SHIB', avatar: '👨‍💻', text: 'Pehle doubt tha lekin ab regular investor hoon!' },
  { name: 'Fatima R.', country: 'Pakistan', investment: 'Silver Package', profit: '+200,000 SHIB', avatar: '👩‍🎓', text: 'User-friendly interface aur quick support!' },
]

// User names for transactions
const userNames = ['Ahmad', 'Usman', 'Ali', 'Hassan', 'Fatima', 'Ayesha', 'Sarah', 'Mohammed', 'Abdullah', 'Khalid', 'Omar', 'Imran', 'Bilal', 'Zain', 'Hamza']

// WhatsApp Icon Component
function WAIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-purple-950 border-t border-purple-800/50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg">🐕</div>
              <span className="text-2xl font-bold"><span className="text-yellow-400">Shiba</span><span className="text-white">Lab</span></span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Professional SHIB mining platform with 140% total return in 30 days. Trusted by 127,000+ users worldwide.</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all">
              <WAIcon /> WhatsApp Support
            </a>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-yellow-400">📊 Calculator</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400">📦 Packages</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400">❓ FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Deposit Address</h4>
            <code className="text-yellow-400 text-xs break-all">{PLATFORM_WALLET}</code>
          </div>
        </div>
        <div className="border-t border-purple-800/50 pt-6 text-center">
          <p className="text-gray-500 text-sm">© 2024 ShibaLab Mining Platform. 140% Total Return | 30 Days | BSC Network</p>
        </div>
      </div>
    </footer>
  )
}

// FAQ
const faqs = [
  { q: 'How do I start mining SHIB?', a: 'Connect your BSC wallet (starting with 0x), choose a package from 100,000 SHIB, and start earning. Mining runs 24/7 for 30 days.' },
  { q: 'What wallet address is required?', a: 'Only valid BSC addresses starting with "0x" and 42 characters long are accepted.' },
  { q: 'What is the minimum deposit?', a: 'Minimum deposit is 100,000 SHIB for Starter package. You receive 140,000 SHIB after 30 days!' },
  { q: 'How much can I earn?', a: '140% total return after 30 days. Example: Invest 100,000 → Get 140,000 SHIB (40% profit).' },
  { q: 'What happens after 30 days?', a: 'Your package ends and you receive 140% return. Start a new package to continue earning!' },
  { q: 'Is there a referral program?', a: 'Yes! Share your referral link and earn 5% bonus for every new miner!' },
]

// Format number
function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(decimals) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(decimals) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(decimals) + 'K'
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function formatExact(num: number, decimals: number = 5): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

// Calculate earnings
const calcEarnings = (investment: number) => {
  const profit = investment * 0.4
  const totalReturn = investment + profit
  return {
    perSecond: profit / 30 / 86400,
    perMinute: profit / 30 / 1440,
    perHour: profit / 30 / 24,
    perDay: profit / 30,
    perWeek: profit / 30 * 7,
    perMonth: profit,
    totalReturn,
    profit
  }
}

// Validate BSC
const isValidBSC = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr)

// Generate transaction
const genTx = (type: 'deposit' | 'withdraw') => {
  const pkg = miningPackages[Math.floor(Math.random() * miningPackages.length)]
  const amount = type === 'deposit' ? pkg.deposit : pkg.totalReturn
  return {
    id: Date.now() + Math.random(),
    amount,
    display: formatNumber(amount) + ' SHIB',
    name: userNames[Math.floor(Math.random() * userNames.length)],
    wallet: '0x' + [...Array(40)].map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type
  }
}

// Animated counter
const useCount = (end: number, dur: number = 2000, start: boolean = true) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let t: number | null = null
    const animate = (now: number) => {
      if (!t) t = now
      const p = Math.min((now - t) / dur, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 4)) * end))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, dur, start])
  return count
}

// Platform stats
const getStats = () => ({
  totalUsers: 127845 + Math.floor(Math.random() * 100),
  totalInvestment: 892456000000,
  totalWithdrawals: 356789000000,
  online: 2847 + Math.floor(Math.random() * 200),
})

// User data type from API
type UserData = {
  id: string
  wallet: string
  balance: number
  totalInvested: number
  totalEarned: number
  referredBy: string | null
  referralCode: string
  referralEarnings: number
  referralCount: number
  isActive: boolean
  activePackage: {
    packageId: number
    investment: number
    dailyEarning: number
    totalReturn: number
    daysRemaining: number
    startDate: string
    endDate: string
  } | null
  deposits: any[]
  withdrawals: any[]
  transactions: any[]
}

export default function Home() {
  // State
  const [wallet, setWallet] = useState('')
  const [view, setView] = useState<'landing' | 'dashboard' | 'deposit' | 'withdraw' | 'referral' | 'packages'>('landing')
  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [calcInput, setCalcInput] = useState('')
  const [calcRes, setCalcRes] = useState<ReturnType<typeof calcEarnings> | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedPackage, setSelectedPackage] = useState(miningPackages[0])
  const [depAmount, setDepAmount] = useState('')
  const [depTx, setDepTx] = useState('')
  const [withAmount, setWithAmount] = useState('')
  const [withAddr, setWithAddr] = useState('')
  const [txs, setTxs] = useState(() => Array(8).fill(null).map(() => genTx(Math.random() > 0.3 ? 'deposit' : 'withdraw')))
  const [stats, setStats] = useState(getStats)
  const [statsVisible, setStatsVisible] = useState(false)
  const [showRefBanner, setShowRefBanner] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.has('ref')
    }
    return false
  })
  const [submitting, setSubmitting] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  
  // Animated counters
  const animUsers = useCount(stats.totalUsers, 3000, statsVisible)
  const animInv = useCount(Math.floor(stats.totalInvestment / 1000000), 3000, statsVisible)
  const animWith = useCount(Math.floor(stats.totalWithdrawals / 1000000), 3000, statsVisible)
  const animOnline = useCount(stats.online, 2000, statsVisible)

  // Effects
  useEffect(() => {
    const obs = new IntersectionObserver((e) => { if (e[0].isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const int = setInterval(() => setTxs(p => [genTx(Math.random() > 0.35 ? 'deposit' : 'withdraw'), ...p.slice(0, 19)]), 5000)
    return () => clearInterval(int)
  }, [])

  useEffect(() => {
    const int = setInterval(() => setStats(p => ({ ...p, online: 2847 + Math.floor(Math.random() * 200) })), 30000)
    return () => clearInterval(int)
  }, [])

  // Fetch user data from API
  const fetchUserData = async (walletAddress: string) => {
    try {
      const res = await fetch(`/api/user?wallet=${walletAddress}`)
      const data = await res.json()
      if (data.success) {
        setUserData(data.user)
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    }
  }

  // Fetch platform stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setStats({
          totalUsers: data.stats.totalUsers,
          totalInvestment: data.stats.totalInvested,
          totalWithdrawals: data.stats.totalWithdrawn,
          online: data.stats.onlineUsers,
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  // Real-time balance update (simulate earning)
  useEffect(() => {
    if (!loggedIn || !userData?.activePackage) return
    const dailyEarning = userData.activePackage.dailyEarning
    const perSecond = dailyEarning / 86400
    const int = setInterval(() => {
      setUserData(prev => prev ? {
        ...prev,
        balance: prev.balance + perSecond,
        totalEarned: prev.totalEarned + perSecond
      } : null)
    }, 1000)
    return () => clearInterval(int)
  }, [loggedIn, userData?.activePackage])

  // Refresh user data periodically
  useEffect(() => {
    if (!loggedIn || !wallet) return
    const int = setInterval(() => fetchUserData(wallet), 30000)
    return () => clearInterval(int)
  }, [loggedIn, wallet])

  // Handlers
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  const connect = async () => {
    setError('')
    const t = wallet.trim()
    if (!t) { setError('Please enter your BSC wallet address'); return }
    if (!t.startsWith('0x')) { setError('Wallet must start with "0x"'); return }
    if (t.length !== 42) { setError(`Must be 42 characters (currently ${t.length})`); return }
    if (!isValidBSC(t)) { setError('Invalid BSC address format'); return }
    setLoading(true)
    
    try {
      // Register/login user via API
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: t }),
      })
      const data = await res.json()
      
      if (data.success) {
        setUserData(data.user)
        setLoggedIn(true)
        setView('dashboard')
        setWithAddr(t)
        fetchStats()
      } else {
        setError(data.error || 'Failed to connect')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCalc = (v: string) => {
    setCalcInput(v)
    const n = parseFloat(v.replace(/,/g, ''))
    setCalcRes(!isNaN(n) && n > 0 ? calcEarnings(n) : null)
  }

  const handleDep = async () => {
    if (!depAmount || parseFloat(depAmount) < 100000) { alert('Minimum 100,000 SHIB'); return }
    if (!depTx || depTx.length < 10) { alert('Enter valid transaction hash'); return }
    if (!wallet) { alert('Please connect wallet first'); return }
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          amount: parseFloat(depAmount),
          packageId: selectedPackage.id,
          transactionHash: depTx,
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Deposit confirmed! Mining has started.')
        setDepAmount('')
        setDepTx('')
        fetchUserData(wallet)
        fetchStats()
      } else {
        alert(data.error || 'Deposit failed')
      }
    } catch (err) {
      alert('Failed to submit deposit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWith = async () => {
    if (!withAmount || parseFloat(withAmount) < 50000) { alert('Minimum 50,000 SHIB'); return }
    if (!withAddr || !isValidBSC(withAddr)) { alert('Enter valid BSC address'); return }
    if (!wallet) { alert('Please connect wallet first'); return }
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          amount: parseFloat(withAmount),
          walletAddress: withAddr,
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Withdrawal submitted! You will receive SHIB within 24 hours.')
        setWithAmount('')
        fetchUserData(wallet)
      } else {
        alert(data.error || 'Withdrawal failed')
      }
    } catch (err) {
      alert('Failed to submit withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  // LANDING PAGE
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white">
        {/* Referral Banner */}
        {showRefBanner && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🎉</span>
              <span className="font-bold">Welcome! You were referred by a friend. Sign up now to get 5% bonus!</span>
              <button type="button" onClick={() => setShowRefBanner(false)} className="ml-4 text-white/80 hover:text-white">✕</button>
            </div>
          </div>
        )}
        
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
            </div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-sm font-medium">🟢 {animOnline.toLocaleString()} Users Online</span>
            </div>
            
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-7xl shadow-2xl shadow-yellow-500/30 animate-bounce">🐕</div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="text-yellow-400">Shiba</span><span className="text-white">Lab</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-2">Mining Platform</p>
            
            <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border-2 border-yellow-500/50 rounded-3xl p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">140% Total Return</p>
              <p className="text-xl text-white">40% Profit in 30 Days</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
              {[
                { icon: '👥', value: '127K+', label: 'Total Users' },
                { icon: '💰', value: '892M+', label: 'SHIB Invested' },
                { icon: '💸', value: '356M+', label: 'SHIB Withdrawn' },
                { icon: '⭐', value: '4.9/5', label: 'User Rating' },
              ].map((s, i) => (
                <div key={i} className="bg-purple-800/30 border border-purple-600/30 rounded-2xl p-4">
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-gray-400 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button type="button" onClick={() => document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold text-lg rounded-2xl hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-500/30 transition-all transform hover:scale-105">
                🚀 Start Mining Now
              </button>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 text-white font-bold text-lg rounded-2xl hover:bg-green-400 shadow-lg shadow-green-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                <WAIcon /> WhatsApp Support
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span>🔒 Secure Platform</span>
              <span>⚡ Instant Activation</span>
              <span>💳 BSC Network</span>
              <span>🌍 Worldwide</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section ref={statsRef} className="py-16 bg-gradient-to-b from-purple-900/50 to-purple-950/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📊 Platform Statistics</h2>
              <p className="text-gray-400">Live growing numbers</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '👥', value: animUsers.toLocaleString(), label: 'Total Users', color: 'yellow' },
                { icon: '💰', value: animInv.toLocaleString() + 'M', label: 'Total Investment', color: 'green' },
                { icon: '💸', value: animWith.toLocaleString() + 'M', label: 'Total Withdrawals', color: 'blue' },
                { icon: '🟢', value: animOnline.toLocaleString(), label: 'Online Now', color: 'orange' },
              ].map((s, i) => (
                <div key={i} className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 rounded-3xl p-6 border border-purple-600/30 text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${s.color === 'yellow' ? 'from-yellow-400 to-amber-500' : s.color === 'green' ? 'from-green-400 to-emerald-500' : s.color === 'blue' ? 'from-blue-400 to-cyan-500' : 'from-orange-400 to-red-500'}`}></div>
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <p className={`text-3xl md:text-4xl font-bold font-mono ${s.color === 'yellow' ? 'text-white' : s.color === 'green' ? 'text-green-400' : s.color === 'blue' ? 'text-blue-400' : 'text-orange-400'}`}>{s.value}</p>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-16 bg-gradient-to-b from-purple-950/50 to-purple-900/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🧮 Profit Calculator</h2>
              <p className="text-gray-400">Calculate your 140% return</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800/50 via-purple-900/50 to-indigo-900/50 rounded-3xl p-8 border border-purple-600/30 shadow-2xl">
              <div className="mb-8">
                <label className="block text-gray-300 text-sm font-medium mb-3">Enter Investment (SHIB)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="e.g. 100000" value={calcInput}
                    onChange={(e) => handleCalc(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-6 py-4 text-2xl font-mono rounded-2xl bg-purple-950/50 border-2 border-purple-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-lg">SHIB</span>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[100000, 250000, 500000, 1000000, 2500000, 5000000].map((a) => (
                    <button type="button" key={a} onClick={() => handleCalc(a.toString())}
                      className="px-4 py-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all">{formatNumber(a, 0)}</button>
                  ))}
                </div>
              </div>

              {calcRes && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border-2 border-yellow-500/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">You Invest</p>
                          <p className="text-white font-bold text-2xl">{formatNumber(parseFloat(calcInput.replace(/,/g, '')))} SHIB</p>
                        </div>
                        <span className="text-yellow-400 text-4xl">→</span>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">You Receive</p>
                          <p className="text-yellow-400 font-bold text-2xl">{formatNumber(calcRes.totalReturn)} SHIB</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                        <span className="px-4 py-2 bg-green-500/20 rounded-full text-green-400 font-bold">+{formatNumber(calcRes.profit)} Profit (40%)</span>
                        <span className="px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-400 font-bold">140% Total Return</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-900/30 rounded-2xl p-6 border border-purple-600/30">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">📈 Earnings Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-green-900/40 rounded-xl p-4 border border-green-500/30">
                        <p className="text-gray-400 text-xs mb-1">⚡ Per Second</p>
                        <p className="text-green-400 font-bold">+{calcRes.perSecond.toFixed(8)}</p>
                      </div>
                      <div className="bg-green-900/40 rounded-xl p-4 border border-green-500/30">
                        <p className="text-gray-400 text-xs mb-1">⏱️ Per Minute</p>
                        <p className="text-green-400 font-bold">+{calcRes.perMinute.toFixed(6)}</p>
                      </div>
                      <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-500/30">
                        <p className="text-gray-400 text-xs mb-1">🕐 Per Hour</p>
                        <p className="text-blue-400 font-bold">+{calcRes.perHour.toFixed(4)}</p>
                      </div>
                      <div className="bg-yellow-900/40 rounded-xl p-4 border border-yellow-500/30">
                        <p className="text-gray-400 text-xs mb-1">📅 Per Day</p>
                        <p className="text-yellow-400 font-bold">+{formatNumber(calcRes.perDay)}</p>
                      </div>
                      <div className="bg-orange-900/40 rounded-xl p-4 border border-orange-500/30">
                        <p className="text-gray-400 text-xs mb-1">📆 Per Week</p>
                        <p className="text-orange-400 font-bold">+{formatNumber(calcRes.perWeek)}</p>
                      </div>
                      <div className="bg-purple-900/40 rounded-xl p-4 border border-purple-500/30">
                        <p className="text-gray-400 text-xs mb-1">🗓️ 30 Days</p>
                        <p className="text-purple-400 font-bold">+{formatNumber(calcRes.perMonth)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!calcRes && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🧮</div>
                  <p className="text-gray-400">Enter investment amount to calculate</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 bg-gradient-to-b from-purple-900/50 to-purple-950/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📦 Mining Packages</h2>
              <p className="text-gray-400">140% Total Return in 30 Days</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miningPackages.map((pkg) => (
                <div key={pkg.id}
                  className={`relative bg-gradient-to-br ${pkg.color} bg-opacity-20 rounded-3xl p-6 border-2 ${pkg.popular ? 'border-yellow-500 shadow-xl shadow-yellow-500/20' : 'border-purple-600/30'} hover:border-yellow-500/50 transition-all transform hover:scale-105`}>
                  {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">⭐ POPULAR</div>}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-gray-300 text-sm">{pkg.dh_s} DH/s Mining Speed</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between bg-black/20 rounded-lg px-4 py-2">
                      <span className="text-gray-300">Investment:</span>
                      <span className="text-white font-bold">{formatNumber(pkg.deposit, 0)} SHIB</span>
                    </div>
                    <div className="flex justify-between bg-black/20 rounded-lg px-4 py-2">
                      <span className="text-gray-300">Total Return:</span>
                      <span className="text-yellow-400 font-bold">{formatNumber(pkg.totalReturn, 0)} SHIB</span>
                    </div>
                    <div className="flex justify-between bg-black/20 rounded-lg px-4 py-2">
                      <span className="text-gray-300">Your Profit:</span>
                      <span className="text-green-400 font-bold">+{formatNumber(pkg.profit, 0)} SHIB</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelected(pkg); document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="w-full py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all">Invest Now</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Transactions */}
        <section className="py-16 bg-gradient-to-b from-purple-950/50 to-purple-900/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🔄 Live Transactions</h2>
              <p className="text-gray-400">Real-time deposits and withdrawals</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 rounded-3xl border border-purple-600/30 overflow-hidden">
              <div className="bg-purple-800/50 px-6 py-4 border-b border-purple-600/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Feed
                  </h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTab('deposit')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'deposit' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-gray-400 hover:text-white'}`}>💰 Deposits</button>
                    <button type="button" onClick={() => setTab('withdraw')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'withdraw' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-gray-400 hover:text-white'}`}>💸 Withdrawals</button>
                  </div>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {txs.filter(t => t.type === tab).slice(0, 10).map((t, i) => (
                  <div key={t.id} className={`px-6 py-4 border-b border-purple-700/30 hover:bg-purple-700/20 transition-all ${i === 0 ? 'bg-purple-700/10' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${t.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-white font-medium">{t.name}</span>
                        {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">New</span>}
                      </div>
                      <span className="text-white font-bold">{t.display}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs font-mono truncate max-w-[200px]">{t.wallet.slice(0, 10)}...{t.wallet.slice(-6)}</p>
                      <span className="text-gray-500 text-xs">{t.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gradient-to-b from-purple-900/50 to-purple-950/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">💬 User Testimonials</h2>
              <p className="text-gray-400">What our miners say</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 rounded-2xl p-6 border border-purple-600/30 hover:border-yellow-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl">{t.avatar}</div>
                    <div>
                      <p className="text-white font-bold">{t.name}</p>
                      <p className="text-gray-400 text-sm">{t.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-700/50 rounded-lg text-xs text-gray-300">{t.investment}</span>
                    <span className="px-2 py-1 bg-green-500/20 rounded-lg text-xs text-green-400">{t.profit}</span>
                  </div>
                  <p className="text-gray-300 text-sm italic">"{t.text}"</p>
                  <div className="flex gap-1 mt-3">{[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400">⭐</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connect Wallet */}
        <section id="connect" className="py-16 bg-gradient-to-b from-purple-950/50 to-purple-900/50">
          <div className="max-w-lg mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">🔗 Connect Wallet</h2>
              <p className="text-gray-400">Enter your BSC wallet address</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800/50 via-purple-900/50 to-indigo-900/50 rounded-3xl p-8 border border-purple-600/30 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">BSC Wallet Address</label>
                  <input type="text" placeholder="Enter full address (e.g. 0x...)" value={wallet}
                    onChange={(e) => { setWallet(e.target.value); setError('') }}
                    onBlur={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-4 rounded-xl bg-purple-950/50 border-2 border-purple-600/50 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-500 text-xs">Must start with "0x" and be 42 characters</p>
                    <p className="text-gray-500 text-xs font-mono">{wallet.length}/42</p>
                  </div>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3"><span className="text-red-400">❌</span><p className="text-red-400 text-sm">{error}</p></div>}
                {isValidBSC(wallet) && !error && <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3"><span className="text-green-400">✅</span><p className="text-green-400 text-sm">Valid BSC wallet address!</p></div>}
                
                <button type="button" onClick={connect} disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-500/30'}`}>
                  {loading ? <><span className="animate-spin">⏳</span> Connecting...</> : <><span>🚀</span> Connect & Start Mining</>}
                </button>
              </div>
              
              <div className="mt-6 bg-purple-900/50 rounded-xl p-4 border border-purple-600/30">
                <p className="text-gray-400 text-sm mb-2">📌 Platform Deposit Address:</p>
                <div className="flex items-center gap-2">
                  <code className="text-yellow-400 font-mono text-xs break-all flex-1">{PLATFORM_WALLET}</code>
                  <button type="button" onClick={() => copy(PLATFORM_WALLET)} className="flex-shrink-0 p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors">{copied ? '✅' : '📋'}</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gradient-to-b from-purple-900/50 to-purple-950/50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">❓ FAQ</h2>
              <p className="text-gray-400">Frequently asked questions</p>
            </div>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="bg-purple-800/30 rounded-2xl border border-purple-600/30 overflow-hidden">
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-purple-700/20 transition-all">
                    <span className="text-white font-medium">{f.q}</span>
                    <span className={`text-yellow-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openFaq === i && <div className="px-6 pb-4"><p className="text-gray-400 text-sm">{f.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white">
      {/* Header */}
      <header className="bg-purple-950/95 backdrop-blur-md border-b border-purple-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg">🐕</div>
            <span className="text-xl font-bold"><span className="text-yellow-400">Shiba</span><span className="text-white">Lab</span></span>
          </div>
          <div className="flex items-center gap-4">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors">
              <WAIcon /> Support
            </a>
            <div className="hidden md:block text-right">
              <p className="text-gray-400 text-xs">Connected Wallet</p>
              <p className="text-white font-mono text-sm">{wallet.slice(0, 6)}...{wallet.slice(-4)}</p>
            </div>
            <button type="button" onClick={() => { setLoggedIn(false); setView('landing'); setWallet('') }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors">Disconnect</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Nav */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'deposit', label: 'Deposit', icon: '💰' },
            { id: 'withdraw', label: 'Withdraw', icon: '💸' },
            { id: 'referral', label: 'Referral', icon: '👥' },
            { id: 'packages', label: 'Packages', icon: '📦' },
          ].map((item) => (
            <button type="button" key={item.id} onClick={() => setView(item.id as typeof view)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${view === item.id ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900' : 'bg-purple-800/50 text-white hover:bg-purple-700/50'}`}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-3xl p-6 border border-purple-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">💰 Your Balance</h3>
                {userData?.activePackage ? (
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Mining Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-400 text-xs font-medium">
                    No Active Package
                  </span>
                )}
              </div>
              <div className="text-center py-8">
                <p className="text-5xl md:text-6xl font-bold text-white font-mono mb-2">{formatExact(userData?.balance || 0)}</p>
                <p className="text-yellow-400 text-2xl">SHIB</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setView('deposit')} className="py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-400 hover:to-emerald-400 transition-all">💰 Deposit</button>
                <button type="button" onClick={() => setView('withdraw')} className="py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:from-red-400 hover:to-pink-400 transition-all">💸 Withdraw</button>
              </div>
            </div>
            
            {/* Active Package */}
            {userData?.activePackage ? (
              <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-3xl p-6 border-2 border-yellow-500/50">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                  ⭐ Active Package: {miningPackages.find(p => p.id === userData.activePackage?.packageId)?.name || 'Unknown'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Investment</p>
                    <p className="text-white font-bold">{formatNumber(userData.activePackage.investment, 0)} SHIB</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Total Return</p>
                    <p className="text-yellow-400 font-bold">{formatNumber(userData.activePackage.totalReturn, 0)} SHIB</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Daily Earnings</p>
                    <p className="text-green-400 font-bold">+{formatNumber(userData.activePackage.dailyEarning, 0)} SHIB</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Remaining</p>
                    <p className="text-white font-bold">{userData.activePackage.daysRemaining} Days</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 rounded-3xl p-8 border border-purple-600/30 text-center">
                <p className="text-gray-400 mb-4">You don't have an active package yet</p>
                <button type="button" onClick={() => setView('deposit')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold">
                  Start Mining Now
                </button>
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-800/30 rounded-2xl p-4 border border-purple-600/30">
                <p className="text-gray-400 text-xs">Total Invested</p>
                <p className="text-white font-bold">{formatNumber(userData?.totalInvested || 0)} SHIB</p>
              </div>
              <div className="bg-purple-800/30 rounded-2xl p-4 border border-purple-600/30">
                <p className="text-gray-400 text-xs">Total Earned</p>
                <p className="text-green-400 font-bold">{formatNumber(userData?.totalEarned || 0)} SHIB</p>
              </div>
              <div className="bg-purple-800/30 rounded-2xl p-4 border border-purple-600/30">
                <p className="text-gray-400 text-xs">Referral Earnings</p>
                <p className="text-yellow-400 font-bold">{formatNumber(userData?.referralEarnings || 0)} SHIB</p>
              </div>
              <div className="bg-purple-800/30 rounded-2xl p-4 border border-purple-600/30">
                <p className="text-gray-400 text-xs">Referrals</p>
                <p className="text-white font-bold">{userData?.referralCount || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Deposit */}
        {view === 'deposit' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-3xl p-6 border border-purple-600/30">
              <h2 className="text-2xl font-bold text-white mb-2">💰 Make Deposit</h2>
              <p className="text-gray-400 text-sm mb-6">Send SHIB to the platform wallet and select a package</p>
              
              {/* Package Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">Select Package</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {miningPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => { setSelectedPackage(pkg); setDepAmount(pkg.deposit.toString()); }}
                      className={`relative p-4 rounded-xl border-2 transition-all ${selectedPackage.id === pkg.id ? 'border-yellow-500 bg-yellow-500/20' : 'border-purple-600/50 bg-purple-900/30 hover:border-yellow-500/50'}`}
                    >
                      {pkg.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐</span>}
                      <p className="text-white font-bold">{pkg.name}</p>
                      <p className="text-yellow-400 text-sm">{formatNumber(pkg.deposit, 0)} SHIB</p>
                      <p className="text-green-400 text-xs">+{formatNumber(pkg.profit, 0)} profit</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-purple-900/50 rounded-2xl p-6 border border-purple-600/30 mb-6">
                <p className="text-gray-400 text-sm mb-2">Platform Deposit Wallet (BSC)</p>
                <div className="flex items-center gap-3">
                  <code className="text-yellow-400 font-mono text-sm break-all flex-1">{PLATFORM_WALLET}</code>
                  <button type="button" onClick={() => copy(PLATFORM_WALLET)} className="flex-shrink-0 p-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors">{copied ? '✅' : '📋'}</button>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <h4 className="text-green-400 font-semibold mb-2">📋 Instructions:</h4>
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Select a package above</li>
                  <li>Copy the platform wallet address</li>
                  <li>Send <span className="text-yellow-400 font-bold">{formatNumber(selectedPackage.deposit, 0)} SHIB</span> (or more) from your BSC wallet</li>
                  <li>Enter transaction hash below</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Amount (SHIB)</label>
                  <input type="text" inputMode="numeric" placeholder="e.g. 100000" value={depAmount} onChange={(e) => setDepAmount(e.target.value)}
                    onBlur={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white font-mono focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Transaction Hash</label>
                  <input type="text" placeholder="0x..." value={depTx} onChange={(e) => setDepTx(e.target.value)}
                    onBlur={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white font-mono text-sm focus:outline-none focus:border-yellow-500/50" />
                </div>
                <button type="button" onClick={handleDep} disabled={submitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${submitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400'}`}>
                  {submitting ? 'Processing...' : 'Submit Deposit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw */}
        {view === 'withdraw' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-3xl p-6 border border-purple-600/30">
              <h2 className="text-2xl font-bold text-white mb-2">💸 Withdraw Funds</h2>
              
              <div className="bg-purple-900/50 rounded-2xl p-6 border border-purple-600/30 mb-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Available Balance</p>
                <p className="text-5xl font-bold text-yellow-400 font-mono">{formatExact(userData?.balance || 0)}</p>
                <p className="text-yellow-400 text-lg mt-1">SHIB</p>
                <p className="text-gray-500 text-sm mt-2">Minimum: 50,000 SHIB</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Amount (SHIB)</label>
                  <input type="text" inputMode="numeric" placeholder="e.g. 50000" value={withAmount} onChange={(e) => setWithAmount(e.target.value)}
                    onBlur={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white font-mono focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Wallet Address (BSC)</label>
                  <input type="text" placeholder="0x..." value={withAddr} onChange={(e) => setWithAddr(e.target.value)}
                    onBlur={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/50 border border-purple-600/50 text-white font-mono text-sm focus:outline-none focus:border-yellow-500/50" />
                </div>
                <button type="button" onClick={handleWith} className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400 transition-all">Request Withdrawal</button>
              </div>
            </div>
          </div>
        )}

        {/* Referral */}
        {view === 'referral' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-3xl p-6 border border-purple-600/30">
              <h2 className="text-2xl font-bold text-white mb-2">👥 Referral Program</h2>
              <p className="text-gray-400 text-sm mb-6">Earn 5% bonus for every new miner!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-900/50 rounded-2xl p-6 border border-purple-600/30 text-center">
                  <p className="text-4xl font-bold text-yellow-400">12</p>
                  <p className="text-gray-400 text-sm">Total Referrals</p>
                </div>
                <div className="bg-purple-900/50 rounded-2xl p-6 border border-purple-600/30 text-center">
                  <p className="text-4xl font-bold text-green-400">256K</p>
                  <p className="text-gray-400 text-sm">Earnings (SHIB)</p>
                </div>
              </div>

              <div className="bg-purple-900/50 rounded-2xl p-6 border border-purple-600/30">
                <p className="text-gray-400 text-sm mb-2">Your Referral Link</p>
                <div className="flex items-center gap-3">
                  <code className="text-yellow-400 font-mono text-sm break-all flex-1">{typeof window !== 'undefined' ? window.location.origin : ''}/?ref={wallet.slice(0, 8)}</code>
                  <button type="button" onClick={() => copy(`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${wallet.slice(0, 8)}`)} className="flex-shrink-0 p-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors">{copied ? '✅' : '📋'}</button>
                </div>
                <p className="text-gray-500 text-xs mt-3">💡 Share this link! When someone joins through your link, you get 5% bonus.</p>
              </div>
            </div>
          </div>
        )}

        {/* Packages */}
        {view === 'packages' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">📦 Mining Packages</h2>
              <p className="text-gray-400">Choose a package to upgrade</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miningPackages.map((pkg) => (
                <div key={pkg.id}
                  className={`relative bg-gradient-to-br ${pkg.color} bg-opacity-20 rounded-3xl p-6 border-2 ${selected.id === pkg.id ? 'border-yellow-500' : 'border-purple-600/30'} hover:border-yellow-500/50 transition-all`}>
                  {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">⭐ POPULAR</div>}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-gray-300 text-sm">{pkg.dh_s} DH/s</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between"><span className="text-gray-300">Investment:</span><span className="text-white font-bold">{formatNumber(pkg.deposit, 0)} SHIB</span></div>
                    <div className="flex justify-between"><span className="text-gray-300">Return:</span><span className="text-yellow-400 font-bold">{formatNumber(pkg.totalReturn, 0)} SHIB</span></div>
                    <div className="flex justify-between"><span className="text-gray-300">Profit:</span><span className="text-green-400 font-bold">+{formatNumber(pkg.profit, 0)} SHIB</span></div>
                  </div>
                  <button type="button" onClick={() => { setSelected(pkg); setView('deposit') }}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${selected.id === pkg.id ? 'bg-yellow-500 text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                    {selected.id === pkg.id ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
