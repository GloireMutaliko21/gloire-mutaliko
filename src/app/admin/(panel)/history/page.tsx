import Link from "next/link";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/db";
import type { RevisionDTO } from "@/lib/types";
import { Revision, VERSIONED_ENTITIES } from "@/models";
import { HistoryList } from "@/components/admin/history-list";
import { ENTITY_LABELS } from "@/components/admin/labels";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Historique" };

export default async function HistoryPage({ searchParams }: PageProps<"/admin/history">) {
  await requireAdmin();
  const requested = (await searchParams).entity;
  const entity = (VERSIONED_ENTITIES as readonly string[]).includes(String(requested)) ? String(requested) : null;
  await connectDB();

  const revisions = serialize<RevisionDTO[]>(
    await Revision.find(entity ? { entity } : {}).sort({ createdAt: -1 }).limit(150).lean(),
  );
  const latest = await Revision.aggregate<{ _id: string; version: number }>([
    { $match: { entityId: { $in: [...new Set(revisions.map((r) => r.entityId))].map((id) => new Types.ObjectId(id)) } } },
    { $group: { _id: "$entityId", version: { $max: "$version" } } },
  ]);
  const latestVersion = Object.fromEntries(latest.map((l) => [String(l._id), l.version]));

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
