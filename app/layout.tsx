import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'SecureGate — Production-Grade Auth & Access Control',
  description:
    'A standalone, production-ready authentication system with email verification, password reset, rate limiting, and role-based access control.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
