import type { Metadata } from 'next'

import SignUpForm from '@/components/auth/sign-up-form'

export const metadata: Metadata = {
  title: 'Sign Up — SecureGate',
  description: 'Create your SecureGate account to get started with secure authentication.',
}

export default function SignUpPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6">
      <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50" id="signup-title">
            Create your account
          </h1>
        </div>
        <SignUpForm />
      </div>
    </main>
  )
}


