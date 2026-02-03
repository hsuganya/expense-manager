/**
 * Script to create a user account in Supabase
 * Usage: npx tsx scripts/create-user.ts <email> <password>
 * Example: npx tsx scripts/create-user.ts hsuganya@example.com password123
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../lib/database.types'

async function createUser(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables')
    console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file')
    process.exit(1)
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  console.log(`\n🔐 Creating user account for: ${email}`)
  console.log('⏳ Please wait...\n')

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (error) {
      console.error('❌ Error creating user:', error.message)
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
        console.log('\n📧 A confirmation email has been sent to:', email)
        console.log('   Please check your email and confirm your account.')
        console.log('\n💡 Note: If email confirmation is disabled in Supabase,')
        console.log('   you can sign in directly with the credentials.')
      }
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('Usage: npx tsx scripts/create-user.ts <email> <password>')
  console.log('\nExample:')
  console.log('  npx tsx scripts/create-user.ts hsuganya@example.com mypassword123')
  console.log('\nOr use the npm script:')
  console.log('  npm run create-user hsuganya@example.com mypassword123')
  process.exit(1)
}

const [email, password] = args

if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long')
  process.exit(1)
}

createUser(email, password)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed to create user:', error)
    process.exit(1)
  })
