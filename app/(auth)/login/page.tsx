import type { Metadata } from 'next'

import LoginForm from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In — SecureGate',
  description: 'Sign in to your SecureGate account.',
}

export default function LoginPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6">
      <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50" id="login-title">
            Sign in to SecureGate
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Welcome back! Please enter your details.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
