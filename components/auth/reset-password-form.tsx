'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

import Spinner from '@/components/ui/spinner'
import PasswordStrength from '@/components/auth/password-strength'
import { resetPasswordSchema } from '@/lib/validations/auth'

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps): React.ReactElement {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const parsed = resetPasswordSchema.safeParse({ token, password })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      setError(firstError?.message ?? 'Invalid input.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data: { success: boolean; email?: string; error?: string } = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      setSuccess('Password reset successfully! Logging you in...')

      // Perform automatic sign in
      if (data.email) {
        const loginResult = await signIn('credentials', {
          email: data.email,
          password,
          redirect: false,
        })

        if (loginResult?.error) {
          setError('Password reset but auto-login failed. Please sign in manually.')
          return
        }

        router.push('/dashboard')
        router.refresh()
      } else {
        router.push('/login')
      }
    } catch {
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="reset-password-form">
      {error && (
        <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3">
          <p className="auth-error" role="alert" aria-live="polite">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-950 border border-emerald-800 px-4 py-3">
          <p className="auth-success" role="alert" aria-live="polite">{success}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="auth-label">
          New password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="auth-input"
          disabled={isLoading}
          autoComplete="new-password"
        />
        <PasswordStrength password={password} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="auth-label">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="auth-input"
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="auth-btn mt-1"
        id="reset-password-submit"
      >
        {isLoading ? <Spinner /> : 'Reset Password'}
      </button>

      {error && (error.includes('expired') || error.includes('invalid')) && (
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="inline-flex w-full justify-center rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-50 hover:bg-zinc-700 transition-colors duration-150"
          >
            Resend Link
          </Link>
        </div>
      )}

      <p className="text-center text-sm text-zinc-400 mt-2">
        <Link href="/login" className="auth-link">
          Back to login
        </Link>
      </p>
    </form>
  )
}
