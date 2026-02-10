'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getRedirectResult } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'

/**
 * Handles OAuth redirect result on any page load. Firebase may redirect the user
 * back to "/" or "/login" after sign-in; calling getRedirectResult() here ensures
 * we process the result and create a session no matter which page they land on.
 */
export default function AuthRedirectHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const auth = getFirebaseAuth()
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return

        const idToken = await result.user.getIdToken()
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })

        if (!res.ok) {
          const isLoginPage = pathname === '/login'
          if (isLoginPage) {
            window.location.href = '/login?error=session_failed'
          } else {
            router.replace(`/login?error=session_failed`)
          }
          return
        }

        router.replace('/dashboard')
        router.refresh()
      })
      .catch(() => {
        if (pathname === '/login') {
          window.location.href = '/login?error=auth_callback'
        } else {
          router.replace('/login?error=auth_callback')
        }
      })
  }, [router, pathname])

  return null
}
