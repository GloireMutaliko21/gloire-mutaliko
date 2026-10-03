import "server-only";
import { db, must } from "./supabase/server";

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export type DashboardStats = {
  days: Range;
  views: number;
  visitors: number;
  downloads: number;
  downloadsAllTime: number;
  unread: number;
  messages: number;
  daily: { date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number; en: number; fr: number }[];
  countries: { country: string; views: number; visitors: number }[];
  referrers: { host: string; views: number }[];
};

/** "/fr/projects/x" and "/en/projects/x" count as one page: "/projects/x". */
function stripLocale(path: string) {
  return path.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
}

type RawStats = {
  since: string;
  views: number;
  visitors: number;
  daily: { date: string; views: number; visitors: number }[];
  pages: { path: string; locale: string; views: number }[];
  countries: { country: string; views: number; visitors: number }[];
  referrers: { host: string; views: number }[];
  downloads: number;
  downloadsAllTime: number;
  unread: number;
  messages: number;
};

/** One call to the dashboard_stats SQL function (see supabase/migrations). */
export async function getDashboardStats(days: Range): Promise<DashboardStats> {
  const raw = must(await db().rpc("dashboard_stats", { days })) as RawStats;

  const byDay = new Map(raw.daily.map((d) => [d.date, d]));
  const since = new Date(raw.since);
  const series: DashboardStats["daily"] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    series.push({ date: key, views: byDay.get(key)?.views ?? 0, visitors: byDay.get(key)?.visitors ?? 0 });
  }

  const merged = new Map<string, { path: string; views: number; en: number; fr: number }>();
  for (const row of raw.pages) {
    const key = stripLocale(row.path);
    const entry = merged.get(key) ?? { path: key, views: 0, en: 0, fr: 0 };
    entry.views += row.views;
    if (row.locale === "en") entry.en += row.views;
    if (row.locale === "fr") entry.fr += row.views;
    merged.set(key, entry);
  }

  return {
    days,
    views: raw.views,
    visitors: raw.visitors,
    downloads: raw.downloads,
    downloadsAllTime: raw.downloadsAllTime,
    unread: raw.unread,
    messages: raw.messages,
    daily: series,
    topPages: [...merged.values()].sort((a, b) => b.views - a.views).slice(0, 10),
    countries: raw.countries,
    referrers: raw.referrers,
  };
}
