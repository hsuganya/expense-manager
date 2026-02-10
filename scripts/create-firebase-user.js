/**
 * Creates a Firebase Auth user and a profile document in the expense_manager
 * collection using the Firebase Admin SDK. Loads env from .env.local.
 *
 * Usage: node scripts/create-firebase-user.js [email] [password]
 * Default: hsuganya@gmail.com / Admin@123
 */

require('dotenv').config({ path: '.env.local' })

const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const EXPENSE_MANAGER_COLLECTION = 'expense_manager'

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin env vars in .env.local')
    console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
    process.exit(1)
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

async function main() {
  const email = process.argv[2] || 'hsuganya@gmail.com'
  const password = process.argv[3] || 'Admin@123'

  console.log('Creating Firebase user and expense_manager profile...')
  console.log('Email:', email)

  const app = getAdminApp()
  const auth = getAuth(app)
  const db = getFirestore(app)

  try {
    // Create or get existing user in Firebase Auth
    let user
    try {
      user = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: email.split('@')[0],
      })
      console.log('✅ User created in Firebase Auth:', user.uid)
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        user = await auth.getUserByEmail(email)
        console.log('ℹ️  User already exists in Firebase Auth:', user.uid)
      } else {
        throw err
      }
    }

    const uid = user.uid
    const profileRef = db.collection(EXPENSE_MANAGER_COLLECTION).doc(uid)

    const profileSnap = await profileRef.get()
    if (profileSnap.exists) {
      console.log('ℹ️  Profile already exists in expense_manager/' + uid)
    } else {
      await profileRef.set({
        email,
        displayName: user.displayName || email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('✅ Profile created at expense_manager/' + uid)
    }

    console.log('\nDone. User can sign in at /login with:', email)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }

  process.exit(0)
}

main()
