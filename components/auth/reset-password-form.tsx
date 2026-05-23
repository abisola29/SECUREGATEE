'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

import Spinner from '@/components/ui/spinner'
import PasswordStrength from '@/components/auth/password-strength'
import { resetPasswordSchema } from '@/lib/validations/auth'

const EyeIcon = ({ open }: { open: boolean }): React.ReactElement =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps): React.ReactElement {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input pr-10"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="auth-label">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input pr-10"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            tabIndex={-1}
          >
            <EyeIcon open={showConfirmPassword} />
          </button>
        </div>
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
