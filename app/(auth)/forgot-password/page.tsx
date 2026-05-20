import type { Metadata } from 'next'

import ForgotPasswordForm from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password — SecureGate',
  description: 'Request a link to reset your SecureGate account password.',
}

export default function ForgotPasswordPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6">
      <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50" id="forgot-password-title">
            Reset password
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Enter your email and we&apos;ll send you a password reset link
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  )
}
