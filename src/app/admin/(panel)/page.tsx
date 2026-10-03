import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats, RANGES, type Range } from "@/lib/analytics";
import { DailyChart } from "@/components/admin/daily-chart";
import { cardClass } from "@/components/admin/styles";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Tableau de bord" };

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });
const nf = new Intl.NumberFormat("fr-FR");

function flag(code: string) {
  return code ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";
}
function countryName(code: string) {
  if (!code) return "Inconnu";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const requested = Number((await searchParams).days);
  const days: Range = (RANGES as readonly number[]).includes(requested) ? (requested as Range) : 30;
  const stats = await getDashboardStats(days);

  const tiles = [
    { label: "Visites", value: stats.views, hint: "pages vues" },
    { label: "Visiteurs uniques", value: stats.visitors, hint: "par jour, sans cookie" },
    { label: "Téléchargements du CV", value: stats.downloads, hint: `${nf.format(stats.downloadsAllTime)} au total` },
    { label: "Messages", value: stats.messages, hint: stats.unread ? `${stats.unread} non lus` : "tous lus", href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader title="Tableau de bord">
        <div role="group" aria-label="Période" className="flex rounded-[4px] border border-line-strong bg-surface p-0.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?days=${r}`}
              aria-current={r === days ? "true" : undefined}
              className={`rounded-[3px] px-3 py-1 text-sm tabular-nums ${r === days ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {r} jours
            </Link>
          ))}
        </div>
      </PageHeader>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <>
              <dt className="text-sm text-muted">{t.label}</dt>
              <dd className="mt-2 font-display text-[2.2rem] font-semibold leading-none tabular-nums tracking-tight">{nf.format(t.value)}</dd>
              <dd className="mt-2 text-xs text-muted">{t.hint}</dd>
            </>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className={`${cardClass} block p-5 hover:border-ink`}>
              {body}
            </Link>
          ) : (
            <div key={t.label} className={`${cardClass} p-5`}>
              {body}
            </div>
          );
        })}
      </dl>

      <section className={`${cardClass} mt-6 p-5 pt-6`} aria-labelledby="daily-title">
        <h2 id="daily-title" className="mb-8 font-medium">
          Pages vues par jour
        </h2>
        <DailyChart data={stats.daily} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarList
          title="Pages les plus visitées"
          empty="Aucune visite sur la période."
          rows={stats.topPages.map((p) => ({ key: p.path, label: p.path, value: p.views, detail: `EN ${p.en} · FR ${p.fr}` }))}
        />
        <BarList
          title="Pays des visiteurs"
          empty="Aucun pays détecté. Le pays vient de l’hébergeur (Vercel, Cloudflare)."
          rows={stats.countries.map((c) => ({
            key: c.country || "unknown",
            label: `${flag(c.country)} ${countryName(c.country)}`.trim(),
            value: c.visitors,
            detail: `${c.views} vues`,
          }))}
          unit="visiteurs"
        />
      </div>

      {stats.referrers.length > 0 && (
        <div className="mt-6">
          <BarList title="Sites référents" empty="" rows={stats.referrers.map((r) => ({ key: r.host, label: r.host, value: r.views }))} />
        </div>
      )}
    </>
  );
}

function BarList({
  title,
  rows,
  empty,
  unit = "vues",
}: {
  title: string;
  rows: { key: string; label: string; value: number; detail?: string }[];
  empty: string;
  unit?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead className="sr-only">
            <tr>
              <th>Nom</th>
              <th>{unit}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="group">
                <td className="relative py-1.5 pr-3">
                  <span className="absolute inset-y-0.5 left-0 rounded-[4px] bg-accent-wash" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden />
                  <span className="relative block truncate px-2" title={r.detail}>
                    {r.label}
                  </span>
                </td>
                <td className="w-20 py-1.5 text-right tabular-nums">
                  {nf.format(r.value)}
                  {r.detail && <span className="block text-[11px] text-muted">{r.detail}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
