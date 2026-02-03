/**
 * Script to confirm a user's email address (requires service role key)
 * Usage: node scripts/confirm-user-email.js <email>
 * Example: node scripts/confirm-user-email.js hsuganya@gmail.com
 * 
 * Note: This requires NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function confirmUserEmail(email) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL')
    process.exit(1)
  }

  if (!serviceRoleKey) {
    console.error('❌ Error: Missing service role key')
    console.error('Please add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
    console.error('\nTo get your service role key:')
    console.error('1. Go to your Supabase dashboard')
    console.error('2. Navigate to Settings → API')
    console.error('3. Copy the "service_role" key (keep this secret!)')
    process.exit(1)
  }

  // Use service role key for admin operations
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`\n🔍 Looking up user: ${email}`)
  console.log('⏳ Please wait...\n')

  try {
    // Get user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      process.exit(1)
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ Error: User with email ${email} not found`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)

    if (user.email_confirmed_at) {
      console.log('\n✅ Email is already confirmed!')
      console.log('   User can log in now.')
      return
    }

    // Confirm the email
    console.log('\n📧 Confirming email address...')
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (error) {
      console.error('❌ Error confirming email:', error.message)
      process.exit(1)
    }

    if (data.user) {
      console.log('✅ Email confirmed successfully!')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      console.log('\n✅ User can now log in with:')
      console.log(`   Email: ${data.user.email}`)
      console.log('   Password: (the password you set when creating the account)')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.log('Usage: node scripts/confirm-user-email.js <email>')
  console.log('\nExample:')
  console.log('  node scripts/confirm-user-email.js hsuganya@gmail.com')
  console.log('\nOr use the npm script:')
  console.log('  npm run confirm-email hsuganya@gmail.com')
  process.exit(1)
}

const email = args[0]

confirmUserEmail(email)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed to confirm email:', error)
    process.exit(1)
  })
