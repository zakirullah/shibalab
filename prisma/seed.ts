import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Admin User
  const adminExists = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })

  if (!adminExists) {
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: 'shiba@2024', // In production, hash this!
        role: 'super_admin',
        active: true
      }
    })
    console.log('✅ Admin created')
  } else {
    console.log('ℹ️ Admin already exists')
  }

  // Create Mining Packages
  const packages = [
    {
      name: 'Starter Pack',
      deposit: 50000000, // 50M SHIB
      totalReturn: 65000000, // 65M SHIB
      profit: 15000000, // 15M SHIB
      dh_s: 2.16,
      duration: 30
    },
    {
      name: 'Booster Pack',
      deposit: 100000000, // 100M SHIB
      totalReturn: 140000000, // 140M SHIB
      profit: 40000000, // 40M SHIB
      dh_s: 4.66,
      duration: 30
    },
    {
      name: 'Power Pack',
      deposit: 250000000, // 250M SHIB
      totalReturn: 375000000, // 375M SHIB
      profit: 125000000, // 125M SHIB
      dh_s: 12.5,
      duration: 30
    },
    {
      name: 'Pro Pack',
      deposit: 500000000, // 500M SHIB
      totalReturn: 800000000, // 800M SHIB
      profit: 300000000, // 300M SHIB
      dh_s: 26.66,
      duration: 30
    },
    {
      name: 'Elite Pack',
      deposit: 1000000000, // 1B SHIB
      totalReturn: 1700000000, // 1.7B SHIB
      profit: 700000000, // 700M SHIB
      dh_s: 56.66,
      duration: 30
    },
    {
      name: 'Ultimate Pack',
      deposit: 5000000000, // 5B SHIB
      totalReturn: 9000000000, // 9B SHIB
      profit: 4000000000, // 4B SHIB
      dh_s: 300,
      duration: 30
    }
  ]

  for (const pkg of packages) {
    const exists = await prisma.miningPackage.findFirst({
      where: { name: pkg.name }
    })

    if (!exists) {
      await prisma.miningPackage.create({ data: pkg })
      console.log(`✅ Package created: ${pkg.name}`)
    } else {
      console.log(`ℹ️ Package already exists: ${pkg.name}`)
    }
  }

  // Create Platform Settings
  const settings = [
    { key: 'platform_wallet', value: '0x33cb374635ab51fc669c1849b21b589a17475fc3', description: 'Platform receiving wallet' },
    { key: 'min_withdrawal', value: '10000000', description: 'Minimum withdrawal in SHIB (10M)' },
    { key: 'max_withdrawal', value: '10000000000', description: 'Maximum withdrawal in SHIB (10B)' },
    { key: 'referral_bonus', value: '5', description: 'Referral bonus percentage' },
    { key: 'platform_fee', value: '2', description: 'Platform fee percentage on withdrawals' }
  ]

  for (const setting of settings) {
    const exists = await prisma.platformSetting.findUnique({
      where: { key: setting.key }
    })

    if (!exists) {
      await prisma.platformSetting.create({ data: setting })
      console.log(`✅ Setting created: ${setting.key}`)
    }
  }

  // Create Platform Stats
  const statsExists = await prisma.platformStats.findFirst()
  if (!statsExists) {
    await prisma.platformStats.create({
      data: {
        totalUsers: 0,
        totalInvestment: 0,
        totalWithdrawals: 0,
        activeDeposits: 0
      }
    })
    console.log('✅ Platform stats initialized')
  }

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
