import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mail'
import { rateLimit } from '@/lib/rate-limit'
import { VERIFICATION_TOKEN_EXPIRY_MS } from '@/lib/constants'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const rateLimitResult = await rateLimit(`resend-verification:${ip}`)

    if (!rateLimitResult.success) {
      const minutes = Math.ceil(rateLimitResult.resetInMs / 60000)
      return NextResponse.json(
        { success: false, error: `Too many attempts. Please try again in ${minutes} minutes.` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (!user || user.emailVerified) {
      return NextResponse.json(
        { success: true, message: 'If this email exists and is unverified, a new link has been sent.' },
        { status: 200 }
      )
    }

    await prisma.verificationToken.deleteMany({
      where: { email: parsed.data.email },
    })

    const token = crypto.randomBytes(32).toString('hex')

    await prisma.verificationToken.create({
      data: {
        email: parsed.data.email,
        token,
        expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
    })

    await sendVerificationEmail(parsed.data.email, token)

    return NextResponse.json(
      { success: true, message: 'If this email exists and is unverified, a new link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[RESEND_VERIFICATION]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
