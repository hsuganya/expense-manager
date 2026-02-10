import { getApps, getApp, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId) {
      throw new Error(
        'Missing FIREBASE_PROJECT_ID. Add Firebase Admin env vars for server-side session verification.'
      )
    }

    if (clientEmail && privateKey) {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    }

    return initializeApp({ projectId })
  }
  return getApp() as App
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}
