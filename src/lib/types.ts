import type { L10n } from "./i18n";

export type SkillCategory = "frontend" | "backend" | "devops" | "data" | "tools";

/** A file in the Storage bucket: public URL plus its path inside the bucket. */
export type Asset = { url: string; path: string; width?: number; height?: number; alt?: L10n };

export type ProfileDTO = {
  id?: string;
  name: string;
  role: L10n;
  headline: L10n;
  bio: L10n;
  location: L10n;
  email: string;
  yearsOfExperience: number;
  available: boolean;
  availability: L10n;
  avatar: Asset | null;
  cv: { url: string; path: string; fileName: string } | null;
  socials: { label: string; url: string }[];
  calLink: string;
  updatedAt?: string;
};

export type SkillDTO = {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  order: number;
};

export type ExperienceDTO = {
  id: string;
  company: string;
  companyUrl: string;
  role: L10n;
  location: L10n;
  start: string;
  end: string | null;
  summary: L10n;
  highlights: L10n[];
  stack: string[];
  order: number;
};

export type ProjectDTO = {
  id: string;
  slug: string;
  title: L10n;
  summary: L10n;
  description: L10n;
  images: Asset[];
  tags: string[];
  liveUrl: string;
  repoUrl: string;
  year: number;
  featured: boolean;
  published: boolean;
  order: number;
  updatedAt?: string;
};

export type MessageDTO = {
  id: string;
  name: string;
  email: string;
  company: string;
  body: string;
  locale: string;
  country: string;
  read: boolean;
  createdAt: string;
};

export type VersionedEntity = "profile" | "skill" | "experience" | "project";

export type RevisionDTO = {
  id: string;
  entity: VersionedEntity;
  entityId: string;
  version: number;
  action: "create" | "update" | "delete" | "restore";
  label: string;
  restoredFrom: number | null;
  snapshot: Record<string, unknown>;
  createdAt: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
