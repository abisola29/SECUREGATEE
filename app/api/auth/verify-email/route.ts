import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { verifyEmailSchema } from '@/lib/validations/auth'

interface VerifyEmailResponse {
  success: boolean
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<VerifyEmailResponse>> {
  try {
    const body: unknown = await req.json()
    const parsed = verifyEmailSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: parsed.data.token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: 'This reset link is invalid or has already been used.' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })

      return NextResponse.json(
        { success: false, error: 'This link has expired. Request a new one.' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[VERIFY_EMAIL]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
