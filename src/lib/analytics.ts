import "server-only";
import { connectDB } from "./db";
import { Download, Message, PageView } from "@/models";

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

export async function getDashboardStats(days: Range): Promise<DashboardStats> {
  await connectDB();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const match = { createdAt: { $gte: since } };

  const [totals, daily, pages, countries, referrers, downloads, downloadsAllTime, unread, messages] = await Promise.all([
    PageView.aggregate<{ views: number; visitors: string[] }>([
      { $match: match },
      { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: "$visitor" } } },
    ]),
    PageView.aggregate<{ _id: string; views: number; visitors: number }>([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          views: { $sum: 1 },
          v: { $addToSet: "$visitor" },
        },
      },
      { $project: { views: 1, visitors: { $size: "$v" } } },
    ]),
    PageView.aggregate<{ _id: { path: string; locale: string }; views: number }>([
      { $match: match },
      { $group: { _id: { path: "$path", locale: "$locale" }, views: { $sum: 1 } } },
    ]),
    PageView.aggregate<{ _id: string; views: number; visitors: number }>([
      { $match: match },
      { $group: { _id: "$country", views: { $sum: 1 }, v: { $addToSet: "$visitor" } } },
      { $project: { views: 1, visitors: { $size: "$v" } } },
      { $sort: { visitors: -1, views: -1 } },
      { $limit: 12 },
    ]),
    PageView.aggregate<{ _id: string; views: number }>([
      { $match: { ...match, referrer: { $ne: "" } } },
      { $group: { _id: "$referrer", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 8 },
    ]),
    Download.countDocuments({ kind: "cv", ...match }),
    Download.countDocuments({ kind: "cv" }),
    Message.countDocuments({ read: false }),
    Message.countDocuments(match),
  ]);

  const byDay = new Map(daily.map((d) => [d._id, d]));
  const series: DashboardStats["daily"] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    series.push({ date: key, views: byDay.get(key)?.views ?? 0, visitors: byDay.get(key)?.visitors ?? 0 });
  }

  const merged = new Map<string, { path: string; views: number; en: number; fr: number }>();
  for (const row of pages) {
    const key = stripLocale(row._id.path);
    const entry = merged.get(key) ?? { path: key, views: 0, en: 0, fr: 0 };
    entry.views += row.views;
    if (row._id.locale === "en") entry.en += row.views;
    if (row._id.locale === "fr") entry.fr += row.views;
    merged.set(key, entry);
  }

  return {
    days,
    views: totals[0]?.views ?? 0,
    visitors: totals[0]?.visitors.length ?? 0,
    downloads,
    downloadsAllTime,
    unread,
    messages,
    daily: series,
    topPages: [...merged.values()].sort((a, b) => b.views - a.views).slice(0, 10),
    countries: countries.map((c) => ({ country: c._id || "", views: c.views, visitors: c.visitors })),
    referrers: referrers.map((r) => ({ host: r._id, views: r.views })),
  };
}
