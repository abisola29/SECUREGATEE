import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/constants'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const inMemoryStore = new Map<string, RateLimitEntry>()

interface RateLimitResult {
  success: boolean
  remaining: number
  resetInMs: number
}

export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  // Use Upstash if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, `${RATE_LIMIT_WINDOW_MS}ms`),
    })

    const result = await limiter.limit(identifier)

    return {
      success: result.success,
      remaining: result.remaining,
      resetInMs: result.reset - Date.now(),
    }
  }

  // In-memory fallback
  const now = Date.now()
  const entry = inMemoryStore.get(identifier)

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })

    return {
      success: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetInMs: RATE_LIMIT_WINDOW_MS,
    }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      success: false,
      remaining: 0,
      resetInMs: entry.resetAt - now,
    }
  }

  entry.count += 1

  return {
    success: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetInMs: entry.resetAt - now,
  }
}
