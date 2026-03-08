# ShibaLab Mining Platform - Database Setup Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Neon PostgreSQL Database (FREE)

1. Go to: https://console.neon.tech/signup
2. Sign up with GitHub or Email
3. Create a new project named "shibalab-mining"
4. Select region: EU Central (Frankfurt) or closest to you
5. Click "Create Project"

### Step 2: Get Database Connection Strings

After creating the project, you'll see connection strings. Copy both:

**Connection String (Pooled):**
```
postgresql://username:password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Direct Connection:**
```
postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Add to Vercel Environment Variables

Go to your Vercel project:
https://vercel.com/dashboard → my-project → Settings → Environment Variables

Add these variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your pooled connection string |
| `DIRECT_URL` | Your direct connection string |
| `JWT_SECRET` | `shibalab-super-secret-jwt-2024-production` |

### Step 4: Initialize Database

After adding the environment variables, run this SQL in Neon's SQL Editor:

```sql
-- Create tables
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "walletAddress" TEXT UNIQUE NOT NULL,
  "balance" FLOAT DEFAULT 0,
  "totalDeposited" FLOAT DEFAULT 0,
  "totalWithdrawn" FLOAT DEFAULT 0,
  "totalProfit" FLOAT DEFAULT 0,
  "referralCode" TEXT UNIQUE,
  "referredBy" TEXT,
  "status" TEXT DEFAULT 'active',
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "MiningPackage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "deposit" FLOAT NOT NULL,
  "totalReturn" FLOAT NOT NULL,
  "profit" FLOAT NOT NULL,
  "dh_s" FLOAT NOT NULL,
  "duration" INTEGER DEFAULT 30,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Deposit" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "packageId" TEXT REFERENCES "MiningPackage"("id"),
  "amount" FLOAT NOT NULL,
  "txHash" TEXT,
  "status" TEXT DEFAULT 'pending',
  "startedAt" TIMESTAMP,
  "endsAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Withdrawal" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "amount" FLOAT NOT NULL,
  "walletAddress" TEXT NOT NULL,
  "txHash" TEXT,
  "status" TEXT DEFAULT 'pending',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Transaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "amount" FLOAT NOT NULL,
  "status" TEXT DEFAULT 'completed',
  "depositId" TEXT REFERENCES "Deposit"("id"),
  "withdrawalId" TEXT REFERENCES "Withdrawal"("id"),
  "description" TEXT,
  "txHash" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Admin" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT DEFAULT 'admin',
  "active" BOOLEAN DEFAULT true,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "PlatformSetting" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT UNIQUE NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "ChatMessage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "isAdmin" BOOLEAN DEFAULT false,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "PlatformStats" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "totalUsers" INTEGER DEFAULT 0,
  "totalInvestment" FLOAT DEFAULT 0,
  "totalWithdrawals" FLOAT DEFAULT 0,
  "activeDeposits" INTEGER DEFAULT 0,
  "lastUpdated" TIMESTAMP DEFAULT NOW()
);

-- Insert initial data

-- Admin user
INSERT INTO "Admin" ("username", "password", "role", "active")
VALUES ('admin', 'shiba@2024', 'super_admin', true);

-- Mining packages
INSERT INTO "MiningPackage" ("name", "deposit", "totalReturn", "profit", "dh_s", "duration") VALUES
('Starter Pack', 50000000, 65000000, 15000000, 2.16, 30),
('Booster Pack', 100000000, 140000000, 40000000, 4.66, 30),
('Power Pack', 250000000, 375000000, 125000000, 12.5, 30),
('Pro Pack', 500000000, 800000000, 300000000, 26.66, 30),
('Elite Pack', 1000000000, 1700000000, 700000000, 56.66, 30),
('Ultimate Pack', 5000000000, 9000000000, 4000000000, 300, 30);

-- Platform settings
INSERT INTO "PlatformSetting" ("key", "value", "description") VALUES
('platform_wallet', '0x33cb374635ab51fc669c1849b21b589a17475fc3', 'Platform receiving wallet'),
('min_withdrawal', '10000000', 'Minimum withdrawal in SHIB (10M)'),
('max_withdrawal', '10000000000', 'Maximum withdrawal in SHIB (10B)'),
('referral_bonus', '5', 'Referral bonus percentage'),
('platform_fee', '2', 'Platform fee percentage on withdrawals');

-- Platform stats
INSERT INTO "PlatformStats" ("totalUsers", "totalInvestment", "totalWithdrawals", "activeDeposits")
VALUES (0, 0, 0, 0);
```

### Step 5: Redeploy

After setting up the database, redeploy on Vercel:

```bash
vercel --prod
```

Or trigger a new deployment from Vercel Dashboard.

---

## 📝 Alternative: Vercel Postgres

If you prefer Vercel's own Postgres:

1. Go to: https://vercel.com/dashboard → my-project → Storage
2. Click "Create Database"
3. Select "Postgres"
4. Name it "shibalab-db"
5. Region: Washington, D.C., USA (iad1)
6. Click "Create"

Vercel will automatically add the environment variables.

---

## ✅ Verify Setup

After setup, check these endpoints:

- Stats: https://my-project-bay-rho.vercel.app/api/stats
- Admin Panel: https://my-project-bay-rho.vercel.app/admin
  - Username: admin
  - Password: shiba@2024

---

## 🔧 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure Neon database is not suspended (free tier pauses after inactivity)
