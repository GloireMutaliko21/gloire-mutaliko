import { requireAdmin } from "@/lib/auth";
import { fromRows } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import type { SkillDTO } from "@/lib/types";
import { PageHeader } from "@/components/admin/page-header";
import { SkillsEditor } from "@/components/admin/skills-editor";

export const metadata = { title: "Compétences" };

export default async function SkillsPage() {
  await requireAdmin();
  const skills = fromRows<SkillDTO>(must(await db().from("skills").select("*").order("sort_order").order("name")));
  return (
    <>
      <PageHeader title="Compétences" description="Elles alimentent la section Compétences et le graphe 3D du haut de page. Le niveau règle la taille du nœud." />
      <SkillsEditor initial={skills} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
