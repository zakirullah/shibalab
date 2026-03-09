-- ============================================
-- ShibaLab Crypto Payment System Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  wallet VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(255),
  pin_hash VARCHAR(255) NOT NULL,
  pin_salt VARCHAR(255) NOT NULL,
  balance DECIMAL(20, 2) DEFAULT 0,
  total_deposited DECIMAL(20, 2) DEFAULT 0,
  total_withdrawn DECIMAL(20, 2) DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(255),
  referral_earnings DECIMAL(20, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DEPOSITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  tx_hash VARCHAR(255),
  currency VARCHAR(20) DEFAULT 'SHIB',
  confirmations INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  payment_id VARCHAR(255),
  payment_address VARCHAR(255),
  payment_url TEXT,
  gateway VARCHAR(50),
  package_name VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- WITHDRAWALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'processing')),
  admin_notes TEXT,
  processed_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLATFORM STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS platform_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_users INTEGER DEFAULT 0,
  total_deposits DECIMAL(20, 2) DEFAULT 0,
  total_withdrawals DECIMAL(20, 2) DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,
  online_users INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENT GATEWAY CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  gateway VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  min_deposit DECIMAL(20, 2) DEFAULT 100000,
  min_withdrawal DECIMAL(20, 2) DEFAULT 50000,
  deposit_currencies TEXT[] DEFAULT ARRAY['SHIB', 'USDT', 'BNB', 'ETH'],
  withdrawal_currencies TEXT[] DEFAULT ARRAY['SHIB'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_tx_hash ON deposits(tx_hash);
CREATE INDEX IF NOT EXISTS idx_deposits_payment_id ON deposits(payment_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR wallet_address = auth.uid()::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR wallet_address = auth.uid()::text);

-- Users can view their own deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own deposits
CREATE POLICY "Users can insert own deposits" ON deposits
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can view their own withdrawals
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own withdrawals
CREATE POLICY "Users can insert own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role bypasses RLS (for backend operations)
-- This is handled by using SUPABASE_SERVICE_ROLE_KEY

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Log activity function
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_details JSONB,
  p_ip_address VARCHAR(45)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================
INSERT INTO platform_stats (id, total_users, total_deposits, total_withdrawals, total_visitors, online_users)
VALUES (1, 0, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_config (id, gateway, is_active, min_deposit, min_withdrawal)
VALUES (1, 'coinpayments', true, 100000, 50000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
