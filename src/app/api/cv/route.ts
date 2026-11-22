import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import { clientCountry } from "@/lib/rate-limit";
import { Download, Profile } from "@/models";

/** Counts a CV download, then redirects to the file on Cloudinary. */
export async function GET(request: Request) {
  await connection();
  await connectDB();
  const profile = await Profile.findOne().select("cv").lean();
  const url = profile?.cv?.url;
  if (!url) return new Response("No CV has been uploaded yet.", { status: 404 });

  const locale = new URL(request.url).searchParams.get("locale");
  const ua = request.headers.get("user-agent") ?? "";
  if (!/bot|crawl|spider|preview/i.test(ua)) {
    await Download.create({
      kind: "cv",
      locale: isLocale(locale) ? locale : "",
      country: clientCountry(request.headers),
    }).catch((error) => console.error("cv: could not count download", error));
  }

  return Response.redirect(url, 302);
}
