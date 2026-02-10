import { cookies } from 'next/headers'
import { getAdminAuth } from '@/lib/firebase-admin'

const SESSION_COOKIE_NAME = '__session'

export interface AuthUser {
  id: string
  email?: string | null
}

export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) return null

    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return {
      id: decoded.uid,
      email: decoded.email ?? null,
    }
  } catch {
    return null
  }
}
