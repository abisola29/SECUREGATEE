'use client'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): { level: number; label: string } {
  if (password.length === 0) return { level: 0, label: '' }

  const hasMinLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasMinLength) return { level: 1, label: 'Weak' }

  const mixedCaseOrNumbers = (hasUpper && hasLower) || hasNumber

  if (hasUpper && hasLower && hasNumber && hasSpecial) {
    return { level: 3, label: 'Strong' }
  }

  if (mixedCaseOrNumbers) {
    return { level: 2, label: 'Fair' }
  }

  return { level: 1, label: 'Weak' }
}

export default function PasswordStrength({
  password,
}: PasswordStrengthProps): React.ReactElement | null {
  const { level, label } = getStrength(password)

  if (level === 0) return null

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
            level >= 1 ? 'bg-red-500' : 'bg-zinc-700'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
            level >= 2 ? 'bg-amber-500' : 'bg-zinc-700'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
            level >= 3 ? 'bg-emerald-500' : 'bg-zinc-700'
          }`}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1">{label}</p>
    </div>
  )
}
