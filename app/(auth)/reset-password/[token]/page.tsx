import type { Metadata } from 'next'

import ResetPasswordForm from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password — SecureGate',
  description: 'Enter your new password to reset your SecureGate account.',
}

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

export default function ResetPasswordPage({
  params,
}: ResetPasswordPageProps): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6">
      <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50" id="reset-password-title">
            Choose new password
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Enter your new password below to reset your account.
          </p>
        </div>
        <ResetPasswordForm token={params.token} />
      </div>
    </main>
  )
}
