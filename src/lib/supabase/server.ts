import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-side client with the secret key. Tables have RLS on and no policies,
 * so this is the only way in; it must never reach the browser.
 */
export function db() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set. Copy .env.example to .env.local.");
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const BUCKET = process.env.SUPABASE_BUCKET || "portfolio";

/** Throws the Supabase error so callers can use plain try/catch. */
export function must<T>(result: { data: T; error: { message: string; code?: string } | null }): T {
  if (result.error) {
    const error = new Error(result.error.message) as Error & { code?: string };
    error.code = result.error.code;
    throw error;
  }
  return result.data;
}
