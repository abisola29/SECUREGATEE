import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { sendPasswordResetEmail } from '@/lib/mail'
import { rateLimit } from '@/lib/rate-limit'
import { RESET_TOKEN_EXPIRY_MS } from '@/lib/constants'

interface ForgotPasswordResponse {
  success: boolean
  message?: string
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<ForgotPasswordResponse>> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const rateLimitResult = await rateLimit(`forgot-password:${ip}`)

    if (!rateLimitResult.success) {
      const minutes = Math.ceil(rateLimitResult.resetInMs / 60000)
      return NextResponse.json(
        { success: false, error: `Too many attempts. Please try again in ${minutes} minutes.` },
        { status: 429 }
      )
    }

    const body: unknown = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    // Generic message — do not reveal whether the email exists in the system
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If this email exists, a link has been sent.' },
        { status: 200 }
      )
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: parsed.data.email },
    })

    const token = crypto.randomBytes(32).toString('hex')

    await prisma.passwordResetToken.create({
      data: {
        email: parsed.data.email,
        token,
        expires: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
      },
    })

    await sendPasswordResetEmail(parsed.data.email, token)

    return NextResponse.json(
      { success: true, message: 'If this email exists, a link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
