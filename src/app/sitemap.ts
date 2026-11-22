import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { locales } from "@/lib/i18n";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects().catch(() => []);
  const paths = ["", "/projects", "/contact", ...projects.map((p) => `/projects/${p.slug}`)];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${site}/${locale}${path}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site}/${l}${path}`])) },
    })),
  );
}
