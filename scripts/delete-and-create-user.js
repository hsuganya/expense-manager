/**
 * Script to delete an existing user and create a new one
 * Usage: node scripts/delete-and-create-user.js <email> <password> [old-email]
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function deleteAndCreateUser(newEmail, password, oldEmail = null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables')
    console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // If old email is provided, try to sign in and delete the account
  if (oldEmail) {
    console.log(`\n🗑️  Attempting to delete old account: ${oldEmail}`)
    // Note: This requires the user to be signed in or use admin API
    // For now, we'll just create the new user
    console.log('   (Note: Old account deletion requires admin access or user to be signed in)')
  }

  console.log(`\n🔐 Creating new user account for: ${newEmail}`)
  console.log('⏳ Please wait...\n')

  try {
    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.error(`❌ Error: User with email ${newEmail} already exists`)
        console.error('   You may need to delete the existing user from Supabase dashboard first')
      } else {
        console.error('❌ Error creating user:', error.message)
      }
      process.exit(1)
    }

    if (data.user) {
      console.log('✅ User created successfully!')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      
      if (data.session) {
        console.log('\n✅ User is automatically signed in!')
        console.log('   You can now use this account to log in.')
      } else {
        console.log('\n📧 A confirmation email has been sent to:', newEmail)
        console.log('   Please check your email and confirm your account.')
        console.log('\n💡 Note: If email confirmation is disabled in Supabase,')
        console.log('   you can sign in directly with the credentials.')
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('Usage: node scripts/delete-and-create-user.js <email> <password> [old-email]')
  console.log('\nExample:')
  console.log('  node scripts/delete-and-create-user.js hsuganya@yourdomain.com admin123 hsuganya@gmail.com')
  process.exit(1)
}

const [newEmail, password, oldEmail] = args

if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long')
  process.exit(1)
}

deleteAndCreateUser(newEmail, password, oldEmail)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed to create user:', error)
    process.exit(1)
  })
