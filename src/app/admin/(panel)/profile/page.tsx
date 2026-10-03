import { requireAdmin } from "@/lib/auth";
import { defaultProfile } from "@/lib/content";
import { connectDB, serialize } from "@/lib/db";
import type { ProfileDTO } from "@/lib/types";
import { Profile } from "@/models";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileEditor } from "@/components/admin/profile-editor";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  await requireAdmin();
  await connectDB();
  const doc = await Profile.findOne().lean();
  const profile: ProfileDTO = { ...defaultProfile, ...(doc ? serialize<ProfileDTO>(doc) : {}) };

  return (
    <>
      <PageHeader title="Profil" description="Haut de page, section À propos, disponibilité, CV et liens. Chaque enregistrement crée une version dans l’historique." />
      <ProfileEditor initial={profile} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
