import type { RevisionDTO } from "@/lib/types";

export const ENTITY_LABELS: Record<RevisionDTO["entity"], string> = {
  profile: "Profil",
  skill: "Compétence",
  experience: "Expérience",
  project: "Projet",
};
