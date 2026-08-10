import nodemailer from 'nodemailer'

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`
  }
  return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
}


function createTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"SecureGate" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('[MAIL] Failed to send email via SMTP:', err)
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = getBaseUrl()
  const verifyUrl = `${baseUrl}/verify-email/${token}`
  console.log('[MAIL] Verification URL:', verifyUrl)

  await sendEmail(
    email,
    'Verify your email — SecureGate',
    `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #18181b; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #fafafa; margin-bottom: 16px;">
          Verify your email
        </h1>
        <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to verify your email address. This link expires in 15 minutes.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Verify Email
        </a>
        <p style="font-size: 12px; color: #71717a; margin-top: 32px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `
  )
  console.log('[MAIL] Verification email sent to:', email)
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = getBaseUrl()
  const resetUrl = `${baseUrl}/reset-password/${token}`
  console.log('[MAIL] Password reset URL:', resetUrl)

  await sendEmail(
    email,
    'Reset your password — SecureGate',
    `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #18181b; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #fafafa; margin-bottom: 16px;">
          Reset your password
        </h1>
        <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Reset Password
        </a>
        <p style="font-size: 12px; color: #71717a; margin-top: 32px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `
  )
  console.log('[MAIL] Password reset email sent to:', email)
}
