import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { fromRows } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import type { ProjectDTO } from "@/lib/types";
import { PageHeader } from "@/components/admin/page-header";
import { buttonClass, cardClass } from "@/components/admin/styles";

export const metadata = { title: "Projets" };

export default async function ProjectsListPage() {
  await requireAdmin();
  const projects = fromRows<ProjectDTO>(
    must(await db().from("projects").select("*").order("sort_order").order("year", { ascending: false })),
  );

  return (
    <>
      <PageHeader title="Projets" description="Titre, description, jusqu’à 10 images et tags par projet.">
        <Link href="/admin/projects/new" className={buttonClass.primary}>
          <Plus size={15} aria-hidden />
          Nouveau projet
        </Link>
      </PageHeader>
      {projects.length === 0 ? (
        <p className="text-muted">Aucun projet. Créez le premier pour remplir la page Projets.</p>
      ) : (
        <ul className={`${cardClass} divide-y divide-line`}>
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-paper">
                <span className="relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-[3px] bg-accent-wash">
                  {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="72px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.title.fr || p.title.en}</span>
                  <span className="block truncate text-sm text-muted">{p.tags.join(", ")}</span>
                </span>
                <span className="hidden shrink-0 gap-1.5 text-xs sm:flex">
                  {p.featured && <span className="rounded-[3px] bg-accent-wash px-1.5 py-0.5 text-accent">À la une</span>}
                  {!p.published && <span className="rounded-[3px] border border-line-strong px-1.5 py-0.5 text-muted">Brouillon</span>}
                  <span className="px-1.5 py-0.5 tabular-nums text-muted">{p.images.length}/10 img</span>
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
