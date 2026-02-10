'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getRedirectResult } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const next = searchParams.get('next') ?? '/dashboard'

    getRedirectResult(getFirebaseAuth())
      .then(async (result) => {
        if (!result?.user) {
          setStatus('error')
          router.replace(`/login?error=auth_callback`)
          return
        }
        const idToken = await result.user.getIdToken()
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })
        if (!res.ok) {
          setStatus('error')
          router.replace(`/login?error=auth_callback`)
          return
        }
        router.replace(next)
        router.refresh()
      })
      .catch(() => {
        setStatus('error')
        router.replace(`/login?error=auth_callback`)
      })
  }, [router, searchParams])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-red-600">Sign in failed. Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <p className="text-gray-600">Completing sign in...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
