-- ============================================
-- ShibabLab Mining Platform - Supabase Setup
-- 6 Important Features Implementation
-- ============================================

-- ============================================
-- 1. POSTGRESQL DATABASE TABLES
-- ============================================

-- USERS TABLE
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

-- DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(42) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  package_name VARCHAR(50),
  tx_hash VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  profit_rate DECIMAL(5, 2) DEFAULT 40.00,
  duration_days INTEGER DEFAULT 30,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(42) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  tx_hash VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PLATFORM STATS TABLE
CREATE TABLE IF NOT EXISTS platform_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_users INTEGER DEFAULT 0,
  total_deposits DECIMAL(20, 8) DEFAULT 0,
  total_withdrawals DECIMAL(20, 8) DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,
  online_users INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(42) NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(wallet_address);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;

-- USERS TABLE RLS POLICIES
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (wallet_address = current_user);

-- Service role can do everything (for backend)
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- DEPOSITS TABLE RLS POLICIES
-- Users can view their own deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (wallet_address = current_user);

-- Users can insert their own deposits
CREATE POLICY "Users can insert own deposits" ON deposits
  FOR INSERT WITH CHECK (wallet_address = current_user);

-- Service role full access
CREATE POLICY "Service role full access on deposits" ON deposits
  FOR ALL USING (auth.role() = 'service_role');

-- WITHDRAWALS TABLE RLS POLICIES
-- Users can view their own withdrawals
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (wallet_address = current_user);

-- Users can insert their own withdrawals
CREATE POLICY "Users can insert own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (wallet_address = current_user);

-- Service role full access
CREATE POLICY "Service role full access on withdrawals" ON withdrawals
  FOR ALL USING (auth.role() = 'service_role');

-- TRANSACTIONS TABLE RLS POLICIES
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (wallet_address = current_user);

CREATE POLICY "Service role full access on transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- PLATFORM STATS - Everyone can read
CREATE POLICY "Anyone can view platform stats" ON platform_stats
  FOR SELECT USING (true);

CREATE POLICY "Service role full access on platform_stats" ON platform_stats
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 3. FUNCTIONS FOR AUTO-UPDATE
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. INITIAL DATA
-- ============================================

-- Insert initial platform stats
INSERT INTO platform_stats (id, total_users, total_deposits, total_withdrawals, total_visitors, online_users)
VALUES (1, 127845, 892456000000, 356789000000, 8945623, 2847)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. BACKUP & MAINTENANCE NOTES
-- ============================================
-- 
-- DATABASE BACKUPS:
-- Go to Supabase Dashboard → Your Project → Settings → Database
-- - Enable "Point in Time Recovery" for automatic backups
-- - Set backup retention period (7-30 days recommended)
-- - Schedule daily backups
--
-- ============================================

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'ShibaLab Database Setup Complete!';
    RAISE NOTICE 'Tables: users, deposits, withdrawals, transactions, platform_stats';
    RAISE NOTICE 'RLS: Enabled on all tables';
END $$;
