/**
 * In-memory sliding window rate limiter.
 * Works for single-instance deployments (e.g. Render).
 * State resets on process restart — acceptable for abuse protection at this scale.
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

/**
 * Returns true if the request is within the allowed rate.
 * @param key     Unique identifier (e.g. "login:1.2.3.4")
 * @param limit   Max requests per window
 * @param windowSec Window duration in seconds
 */
export function rateLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

// Purge expired buckets every 2 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of store) {
    if (now > b.resetAt) store.delete(k);
  }
}, 120_000);
