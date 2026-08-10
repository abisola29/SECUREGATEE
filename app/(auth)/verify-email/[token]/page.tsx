import type { Metadata } from 'next'

import VerifyEmailCard from '@/components/auth/verify-email-card'

export const metadata: Metadata = {
  title: 'Verify Email — SecureGate',
  description: 'Verify your email address to activate your SecureGate account.',
}

interface VerifyEmailPageProps {
  params: {
    token: string
  }
}

export default function VerifyEmailPage({
  params,
}: VerifyEmailPageProps): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6">
      <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50" id="verify-email-title">
            Verify email address
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            We are confirming your email verification token.
          </p>
        </div>
        <VerifyEmailCard token={params.token} />
      </div>
    </main>
  )
}
