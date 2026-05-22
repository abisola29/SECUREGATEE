import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'
import { rateLimit } from '@/lib/rate-limit'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req): Promise<{
        id: string
        name: string
        email: string
        emailVerified: Date | null
      } | null> {
        const ip = req?.headers?.['x-forwarded-for'] || 'unknown'
        const rateLimitResult = await rateLimit(`login:${ip}`)

        if (!rateLimitResult.success) {
          const minutes = Math.ceil(rateLimitResult.resetInMs / 60000)
          throw new Error(`Too many attempts. Please try again in ${minutes} minutes.`)
        }

        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.emailVerified = (user as { emailVerified: Date | null }).emailVerified
      }

      if (token.email && !token.emailVerified) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { emailVerified: true },
        })
        if (dbUser?.emailVerified) {
          token.emailVerified = dbUser.emailVerified
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string
        ;(session.user as { emailVerified: Date | null }).emailVerified =
          token.emailVerified as Date | null
      }
      return session
    },
  },
}
