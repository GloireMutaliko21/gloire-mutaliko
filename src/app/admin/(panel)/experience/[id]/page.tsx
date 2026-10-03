import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { fromRow } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import { emptyExperience, type ExperienceDraft } from "@/components/admin/defaults";

export const metadata = { title: "Expérience" };

export default async function ExperienceEditPage({ params }: PageProps<"/admin/experience/[id]">) {
  await requireAdmin();
  const { id } = await params;
  let initial: ExperienceDraft = emptyExperience;
  if (id !== "new") {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const row = must(await db().from("experiences").select("*").eq("id", id).maybeSingle());
    if (!row) notFound();
    initial = fromRow<ExperienceDraft>(row);
  }

  return (
    <>
      <Link href="/admin/experience" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} aria-hidden /> Expériences
      </Link>
      <PageHeader title={id === "new" ? "Nouvelle expérience" : initial.company} />
      <ExperienceEditor key={id} initial={initial} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
