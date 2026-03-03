// This file runs before the server starts
// It fixes the DATABASE_URL if it's malformed

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Get DATABASE_URL
    let dbUrl = process.env.DATABASE_URL || ''

    // Remove any quotes, spaces, or line breaks
    dbUrl = dbUrl
      .replace(/^["'\s]+|["'\s]+$/g, '') // Remove quotes and spaces from start/end
      .replace(/\n/g, '') // Remove line breaks
      .replace(/\r/g, '') // Remove carriage returns
      .trim()

    // If URL doesn't start with postgresql://, log error
    if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      console.error('❌ DATABASE_URL format is invalid!')
      console.error('Expected format: postgresql://user:password@host/database')
      console.error('Current format starts with:', dbUrl.substring(0, 20) + '...')

      // Try to fix common issues
      if (dbUrl.includes('postgresql://')) {
        // Extract the actual URL if it's embedded
        const match = dbUrl.match(/postgresql:\/\/[^\s"']+/)
        if (match) {
          dbUrl = match[0]
          console.log('✅ Extracted valid URL from malformed string')
        }
      }
    }

    // Set the cleaned URL back
    process.env.DATABASE_URL = dbUrl

    console.log('🔧 DATABASE_URL configured:', dbUrl ? '✅ Set' : '❌ Not set')
  }
}
