/**
 * Small in-memory fixed-window limiter. It resets on cold starts, which is fine
 * for slowing down form spam and password guessing on a personal site.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) return { ok: false, retryAfterMs: bucket.resetAt - now };
  return { ok: true, retryAfterMs: 0 };
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "0.0.0.0"
  );
}

/** Country code from the hosting edge (Vercel, Cloudflare, Netlify). */
export function clientCountry(headers: Headers) {
  const code =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country") ||
    headers.get("x-nf-country") ||
    "";
  return /^[A-Z]{2}$/.test(code.toUpperCase()) && code.toUpperCase() !== "XX" ? code.toUpperCase() : "";
}
