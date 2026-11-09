import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export type RateLimitEndpoint = "booking" | "gdpr-delete" | "review";

// Sliding windows per identifier (client IP or recipient email). A real
// visitor submits a form once, maybe twice on a retry — these only bite
// repeated/automated submissions.
const LIMITS: Record<RateLimitEndpoint, { max: number; window: `${number} m`; prefix: string }> = {
  booking: { max: 5, window: "10 m", prefix: "mainbar-ratelimit" },
  "gdpr-delete": { max: 2, window: "10 m", prefix: "mainbar-gdpr-ratelimit" },
  review: { max: 3, window: "10 m", prefix: "mainbar-review-ratelimit" },
};
const WINDOW_MS = 10 * 60 * 1000;

// Fallback when Upstash is not configured or unreachable: a per-server-instance
// memory window. Weaker than Redis (each serverless instance counts
// separately) but far better than no limit at all.
const memoryHits = new Map<string, number[]>();

function checkMemoryLimit(key: string, max: number): RateLimitResult {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= max) {
    memoryHits.set(key, hits);
    return { allowed: false, retryAfterSeconds: Math.ceil((hits[0] + WINDOW_MS - now) / 1000) };
  }
  hits.push(now);
  memoryHits.set(key, hits);
  if (memoryHits.size > 10_000) {
    // Drop the oldest key so the map cannot grow without bound.
    const oldest = memoryHits.keys().next().value;
    if (oldest !== undefined) memoryHits.delete(oldest);
  }
  return { allowed: true };
}

const limiters = new Map<RateLimitEndpoint, Ratelimit>();
let warnedMissingConfig = false;

function getLimiter(endpoint: RateLimitEndpoint): Ratelimit | null {
  const existing = limiters.get(endpoint);
  if (existing) return existing;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warnedMissingConfig) {
      console.warn(
        "[rateLimit] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — using a per-instance in-memory limit only. " +
          "Set them in production so the API routes are actually protected against abuse."
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  const { max, window, prefix } = LIMITS[endpoint];
  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
  });
  limiters.set(endpoint, limiter);
  return limiter;
}

export async function checkRateLimit(
  identifier: string,
  endpoint: RateLimitEndpoint = "booking"
): Promise<RateLimitResult> {
  const max = LIMITS[endpoint].max;
  const limiter = getLimiter(endpoint);
  if (!limiter) return checkMemoryLimit(`${endpoint}:${identifier}`, max);

  let result: Awaited<ReturnType<Ratelimit["limit"]>>;
  try {
    result = await limiter.limit(identifier);
  } catch (error) {
    // Redis unreachable: keep a per-instance limit instead of breaking the form.
    console.error("[rateLimit] Upstash error, using in-memory limit:", error);
    return checkMemoryLimit(`${endpoint}:${identifier}`, max);
  }
  if (result.success) return { allowed: true };

  const retryAfterSeconds = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
  return { allowed: false, retryAfterSeconds };
}
