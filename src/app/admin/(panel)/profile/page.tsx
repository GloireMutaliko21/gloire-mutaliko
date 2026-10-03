import { requireAdmin } from "@/lib/auth";
import { readProfile } from "@/lib/content";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileEditor } from "@/components/admin/profile-editor";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  await requireAdmin();
  const profile = await readProfile();

  return (
    <>
      <PageHeader title="Profil" description="Haut de page, section À propos, disponibilité, CV et liens. Chaque enregistrement crée une version dans l’historique." />
      <ProfileEditor initial={profile} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
