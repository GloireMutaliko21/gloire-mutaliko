import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/db";
import { Experience } from "@/models";
import { PageHeader } from "@/components/admin/page-header";
import { ExperienceEditor } from "@/components/admin/experience-editor";
import { emptyExperience, type ExperienceDraft } from "@/components/admin/defaults";

export const metadata = { title: "Expérience" };

export default async function ExperienceEditPage({ params }: PageProps<"/admin/experience/[id]">) {
  await requireAdmin();
  const { id } = await params;
  let initial: ExperienceDraft = emptyExperience;
  if (id !== "new") {
    if (!Types.ObjectId.isValid(id)) notFound();
    await connectDB();
    const doc = await Experience.findById(id).lean();
    if (!doc) notFound();
    initial = serialize<ExperienceDraft>(doc);
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
