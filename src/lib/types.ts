import type { L10n } from "./i18n";

export type SkillCategory = "frontend" | "backend" | "devops" | "data" | "tools";

export type Asset = { url: string; publicId: string; width?: number; height?: number; alt?: L10n };

export type ProfileDTO = {
  _id?: string;
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
  cv: { url: string; publicId: string; fileName: string } | null;
  socials: { label: string; url: string }[];
  calLink: string;
  updatedAt?: string;
};

export type SkillDTO = {
  _id: string;
  name: string;
  category: SkillCategory;
  level: number;
  order: number;
};

export type ExperienceDTO = {
  _id: string;
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
  _id: string;
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
  _id: string;
  name: string;
  email: string;
  company: string;
  body: string;
  locale: string;
  country: string;
  read: boolean;
  createdAt: string;
};

export type RevisionDTO = {
  _id: string;
  entity: "profile" | "skill" | "experience" | "project";
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
