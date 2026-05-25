const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * Checks if a given key (e.g. IP address) exceeds the rate limit.
 * @param key Unique key to rate limit (e.g., IP address + endpoint)
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if rate limited, false otherwise
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Periodic cleanup to prevent memory leaks
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v.lastReset > windowMs * 2) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!record) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}
