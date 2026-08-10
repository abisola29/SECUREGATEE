'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Spinner from '@/components/ui/spinner'

interface VerifyEmailCardProps {
  token: string
}

export default function VerifyEmailCard({ token }: VerifyEmailCardProps): React.ReactElement {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')
  const [resendError, setResendError] = useState('')
  
  const hasVerified = useRef(false)

  const verifyToken = useCallback(async () => {
    if (hasVerified.current) return
    hasVerified.current = true

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!data.success) {
        setStatus('error')
        setErrorMessage(data.error ?? 'Verification failed.')
        return
      }

      setStatus('success')
      setTimeout(() => {
        router.push('/login?verified=true')
      }, 1500)
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again later.')
    }
  }, [token])

  useEffect(() => {
    verifyToken()
  }, [verifyToken])

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResendError('')
    setResendSuccess('')
    setIsResending(true)

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!data.success) {
        setResendError(data.error ?? 'Something went wrong.')
        return
      }

      setResendSuccess(data.message ?? 'Link sent.')
      setEmail('')
    } catch {
      setResendError('Something went wrong. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      {status === 'loading' && (
        <>
          <Spinner />
          <p className="text-zinc-400">Verifying your email address...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="rounded-full bg-emerald-500/20 p-3">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-50">Email Verified</h2>
          <p className="text-zinc-400">Your account is now active.</p>
          <Link href="/login" className="auth-btn w-full mt-4 flex items-center justify-center">
            Sign In
          </Link>
        </>
      )}

      {status === 'error' && (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="rounded-full bg-red-500/20 p-3">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-50">Verification Failed</h2>
          <p className="text-red-400 mb-2">{errorMessage}</p>
          
          <div className="w-full text-left bg-zinc-950 p-6 rounded-xl border border-zinc-800">
            <p className="text-sm text-zinc-300 mb-4 font-medium">Request a new verification link:</p>
            
            <form onSubmit={handleResend} className="flex flex-col gap-4">
              {resendError && (
                <p className="text-sm text-red-400" role="alert" aria-live="polite">{resendError}</p>
              )}
              {resendSuccess && (
                <p className="text-sm text-emerald-400" role="alert" aria-live="polite">{resendSuccess}</p>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="auth-input"
                  disabled={isResending}
                />
              </div>
              <button
                type="submit"
                disabled={isResending || !email}
                className="auth-btn flex items-center justify-center"
              >
                {isResending ? <Spinner /> : 'Resend Link'}
              </button>
            </form>
          </div>
          
          <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 mt-2">
            Back to login
          </Link>
        </div>
      )}
    </div>
  )
}
