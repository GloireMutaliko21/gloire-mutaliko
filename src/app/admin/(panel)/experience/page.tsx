import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { fromRows } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import { formatMonth } from "@/lib/i18n";
import type { ExperienceDTO } from "@/lib/types";
import { PageHeader } from "@/components/admin/page-header";
import { buttonClass, cardClass } from "@/components/admin/styles";

export const metadata = { title: "Expériences" };

export default async function ExperienceListPage() {
  await requireAdmin();
  const items = fromRows<ExperienceDTO>(must(await db().from("experiences").select("*").order("start_month", { ascending: false })));

  return (
    <>
      <PageHeader title="Expériences" description="Le parcours affiché sur l’accueil, du plus récent au plus ancien.">
        <Link href="/admin/experience/new" className={buttonClass.primary}>
          <Plus size={15} aria-hidden />
          Nouvelle expérience
        </Link>
      </PageHeader>
      {items.length === 0 ? (
        <p className="text-muted">Aucune expérience. Ajoutez votre poste actuel pour commencer.</p>
      ) : (
        <ul className={`${cardClass} divide-y divide-line`}>
          {items.map((x) => (
            <li key={x.id}>
              <Link href={`/admin/experience/${x.id}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 hover:bg-paper">
                <span>
                  <span className="font-medium">{x.role.fr || x.role.en}</span>
                  <span className="text-muted"> · {x.company}</span>
                </span>
                <span className="text-sm tabular-nums text-muted">
                  {formatMonth(x.start, "fr")} – {x.end ? formatMonth(x.end, "fr") : "aujourd’hui"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
