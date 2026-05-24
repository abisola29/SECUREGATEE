'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

import Spinner from '@/components/ui/spinner'
import { loginSchema } from '@/lib/validations/auth'

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

export default function LoginForm(): React.ReactElement {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('verified') === 'true') {
        setSuccess('Email successfully verified! Please sign in to access your dashboard.')
      }
      if (params.get('reset') === 'true') {
        setSuccess('Password reset successfully! Please sign in with your new password.')
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    const parsed = loginSchema.safeParse({ email, password })

    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string') {
          errors[field] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('Too many attempts')) {
          setError(result.error)
        } else {
          setError('Invalid email or password.')
        }
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="login-form">
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
        <label htmlFor="email" className="auth-label">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="auth-input"
          aria-describedby="email-error"
          disabled={isLoading}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p id="email-error" className="auth-error" role="alert" aria-live="polite">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <Link href="/forgot-password" className="auth-link text-xs">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input pr-10"
            aria-describedby="password-error"
            disabled={isLoading}
            autoComplete="current-password"
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
        {fieldErrors.password && (
          <p id="password-error" className="auth-error" role="alert" aria-live="polite">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="auth-btn mt-1"
        id="login-submit"
      >
        {isLoading ? <Spinner /> : 'Sign In'}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="auth-link">
          Create one
        </Link>
      </p>
    </form>
  )
}
