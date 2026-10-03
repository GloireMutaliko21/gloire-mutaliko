import { requireAdmin } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/db";
import type { SkillDTO } from "@/lib/types";
import { Skill } from "@/models";
import { PageHeader } from "@/components/admin/page-header";
import { SkillsEditor } from "@/components/admin/skills-editor";

export const metadata = { title: "Compétences" };

export default async function SkillsPage() {
  await requireAdmin();
  await connectDB();
  const skills = serialize<SkillDTO[]>(await Skill.find().sort({ order: 1, name: 1 }).lean());
  return (
    <>
      <PageHeader title="Compétences" description="Elles alimentent la section Compétences et le graphe 3D du haut de page. Le niveau règle la taille du nœud." />
      <SkillsEditor initial={skills} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
