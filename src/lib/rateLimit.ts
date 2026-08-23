/**
 * Rate Limiting & Input Validation Layer
 * Supports Upstash Redis REST API for serverless persistence across Vercel functions.
 * Validates input shape and length without corrupting quotes/apostrophes (relying on React's native JSX escaping).
 */

const ipMemoryStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  ip: string,
  limit: number = 20,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Upstash Redis HTTP API Serverless Persistent Rate Limiter
  if (redisUrl && redisToken) {
    try {
      const key = `ratelimit:${ip}`;
      const windowSeconds = Math.ceil(windowMs / 1000);

      // Multi command via Upstash REST pipeline
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSeconds],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const currentCount = data[0]?.result || 1;
        const remaining = Math.max(0, limit - currentCount);
        return { allowed: currentCount <= limit, remaining };
      }
    } catch {
      // Fallback to in-memory store if Redis request fails
    }
  }

  // In-Memory Fallback
  const now = Date.now();
  const record = ipMemoryStore.get(ip);

  if (!record || now > record.resetTime) {
    ipMemoryStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Validates input string shape, trims whitespace, and enforces max length boundaries.
 * Preserves quotes and apostrophes (e.g. O'Connor, 12" x 10") without corruption,
 * relying on React's native automatic JSX text escaping for XSS protection.
 */
export function validateAndTrimInput(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength);
  }
  return trimmed;
}
