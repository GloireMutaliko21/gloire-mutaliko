import { createHash } from "node:crypto";
import { isLocale } from "@/lib/i18n";
import { clientCountry, clientIp, rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/supabase/server";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|monitor/i;

/**
 * Records an anonymous page view. The visitor id is a daily-rotating hash of
 * IP + user agent, so no cookie is set and no raw IP is stored.
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  if (!path.startsWith("/") || path.startsWith("/admin")) return new Response(null, { status: 204 });

  const ip = clientIp(request.headers);
  if (!rateLimit(`track:${ip}`, 120, 60_000).ok) return new Response(null, { status: 429 });

  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? ""}:${day}:${ip}:${ua}`)
    .digest("hex")
    .slice(0, 20);

  let referrer = "";
  try {
    const ref = typeof body.referrer === "string" && body.referrer ? new URL(body.referrer) : null;
    if (ref && ref.host !== new URL(request.url).host) referrer = ref.host;
  } catch {}

  const segment = path.split("/")[1];
  const { error } = await db().from("page_views").insert({
    path,
    locale: isLocale(segment) ? segment : "",
    country: clientCountry(request.headers),
    visitor,
    referrer,
  });
  if (error) console.error("track: could not record page view", error.message);
  return new Response(null, { status: 204 });
}
