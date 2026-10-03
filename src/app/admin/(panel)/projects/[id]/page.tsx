import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { fromRow } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectEditor } from "@/components/admin/project-editor";
import { emptyProject, type ProjectDraft } from "@/components/admin/defaults";

export const metadata = { title: "Projet" };

export default async function ProjectEditPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const { id } = await params;
  let initial: ProjectDraft = emptyProject();
  if (id !== "new") {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const row = must(await db().from("projects").select("*").eq("id", id).maybeSingle());
    if (!row) notFound();
    initial = fromRow<ProjectDraft>(row);
  }

  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} aria-hidden /> Projets
      </Link>
      <PageHeader title={id === "new" ? "Nouveau projet" : initial.title.fr || initial.title.en} />
      <ProjectEditor key={id} initial={initial} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
