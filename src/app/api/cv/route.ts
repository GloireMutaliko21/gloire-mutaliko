import { connection } from "next/server";
import { isLocale } from "@/lib/i18n";
import { clientCountry } from "@/lib/rate-limit";
import { db, must } from "@/lib/supabase/server";

/** Counts a CV download, then redirects to the file in the Storage bucket. */
export async function GET(request: Request) {
  await connection();
  const profile = must(await db().from("profile").select("cv").order("created_at").limit(1).maybeSingle());
  const url = (profile?.cv as { url?: string } | null)?.url;
  if (!url) return new Response("No CV has been uploaded yet.", { status: 404 });

  const locale = new URL(request.url).searchParams.get("locale");
  const ua = request.headers.get("user-agent") ?? "";
  if (!/bot|crawl|spider|preview/i.test(ua)) {
    const { error } = await db()
      .from("downloads")
      .insert({ kind: "cv", locale: isLocale(locale) ? locale : "", country: clientCountry(request.headers) });
    if (error) console.error("cv: could not count download", error.message);
  }

  return Response.redirect(url, 302);
}
