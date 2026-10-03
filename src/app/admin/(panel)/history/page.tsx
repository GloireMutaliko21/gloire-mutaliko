import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { fromRows } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import type { RevisionDTO } from "@/lib/types";

const VERSIONED_ENTITIES = ["profile", "skill", "experience", "project"] as const;
import { HistoryList } from "@/components/admin/history-list";
import { ENTITY_LABELS } from "@/components/admin/labels";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Historique" };

export default async function HistoryPage({ searchParams }: PageProps<"/admin/history">) {
  await requireAdmin();
  const requested = (await searchParams).entity;
  const entity = (VERSIONED_ENTITIES as readonly string[]).includes(String(requested)) ? String(requested) : null;
  let query = db().from("revisions").select("*").order("created_at", { ascending: false }).limit(150);
  if (entity) query = query.eq("entity", entity);
  const revisions = fromRows<RevisionDTO>(must(await query));

  // Newest version of each listed item, to mark which one is live.
  const ids = [...new Set(revisions.map((r) => r.entityId))];
  const versions = ids.length
    ? must(await db().from("revisions").select("entity_id, version").in("entity_id", ids))
    : [];
  const latestVersion: Record<string, number> = {};
  for (const v of versions ?? []) latestVersion[v.entity_id] = Math.max(latestVersion[v.entity_id] ?? 0, v.version);

  const filters = [{ key: null, label: "Tout" }, ...VERSIONED_ENTITIES.map((e) => ({ key: e, label: ENTITY_LABELS[e] }))];

  return (
    <>
      <PageHeader
        title="Historique"
        description="Chaque enregistrement crée une version (50 conservées par élément). Restaurer remet le contenu en ligne et crée une nouvelle version : rien n’est perdu."
      >
        <div role="group" aria-label="Type de contenu" className="flex flex-wrap rounded-[4px] border border-line-strong bg-surface p-0.5 text-sm">
          {filters.map((f) => (
            <Link
              key={f.key ?? "all"}
              href={f.key ? `/admin/history?entity=${f.key}` : "/admin/history"}
              aria-current={entity === f.key ? "true" : undefined}
              className={`rounded-[3px] px-3 py-1 ${entity === f.key ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </PageHeader>
      <HistoryList revisions={revisions} latestVersion={latestVersion} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
