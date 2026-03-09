-- ShibaLab Mining Platform - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- ===========================================
-- 1. USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  pin_hash VARCHAR(128) NOT NULL,
  pin_salt VARCHAR(32) NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  active_investment DECIMAL(20, 8) DEFAULT 0,
  daily_profit DECIMAL(20, 8) DEFAULT 0,
  total_earned DECIMAL(20, 8) DEFAULT 0,
  total_deposited DECIMAL(20, 8) DEFAULT 0,
  total_withdrawn DECIMAL(20, 8) DEFAULT 0,
  remaining_days INTEGER DEFAULT 0,
  investment_start_date TIMESTAMP,
  investment_end_date TIMESTAMP,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(42),
  referral_earnings DECIMAL(20, 8) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 2. DEPOSITS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  package_name VARCHAR(50),
  tx_hash VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  profit_rate DECIMAL(5, 2) DEFAULT 30.00,
  duration_days INTEGER DEFAULT 30,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 3. WITHDRAWALS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  tx_hash VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 4. REFERRALS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_wallet VARCHAR(42) NOT NULL,
  referred_wallet VARCHAR(42) NOT NULL,
  deposit_amount DECIMAL(20, 8),
  commission DECIMAL(20, 8),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 5. TRANSACTIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 6. CHAT MESSAGES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender VARCHAR(100) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 7. PLATFORM STATS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS platform_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_users INTEGER DEFAULT 0,
  total_deposits DECIMAL(20, 8) DEFAULT 0,
  total_withdrawals DECIMAL(20, 8) DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,
  online_users INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- 8. CREATE INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(wallet_address);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

-- ===========================================
-- 8. INITIALIZE PLATFORM STATS
-- ===========================================
INSERT INTO platform_stats (id, total_users, total_deposits, total_withdrawals, total_visitors, online_users)
VALUES (1, 127845, 892456000000, 356789000000, 8945623, 2847)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 10. RLS POLICIES (Allow service role full access)
-- ===========================================
-- Users can read own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on deposits" ON deposits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on withdrawals" ON withdrawals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on chat_messages" ON chat_messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on platform_stats" ON platform_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Allow public read on platform_stats
CREATE POLICY "Public read on platform_stats" ON platform_stats
  FOR SELECT USING (true);

-- ===========================================
-- DONE! Your database is ready.
-- ===========================================
