import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB, serialize } from "./db";
import { Experience, Profile, Project, Skill } from "@/models";
import type { ExperienceDTO, ProfileDTO, ProjectDTO, SkillDTO } from "./types";

/** Every public read is tagged with this; admin saves call updateTag(CONTENT_TAG). */
export const CONTENT_TAG = "content";

const emptyL10n = { en: "", fr: "" };

export const defaultProfile: ProfileDTO = {
  name: "Gloire Mutaliko",
  role: { en: "Senior software engineer", fr: "Ingénieur logiciel senior" },
  headline: emptyL10n,
  bio: emptyL10n,
  location: emptyL10n,
  email: "",
  yearsOfExperience: 0,
  available: true,
  availability: emptyL10n,
  avatar: null,
  cv: null,
  socials: [],
  calLink: "",
};

export async function getProfile(): Promise<ProfileDTO> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  await connectDB();
  const doc = await Profile.findOne().lean();
  return doc ? { ...defaultProfile, ...serialize<ProfileDTO>(doc) } : defaultProfile;
}

export async function getSkills(): Promise<SkillDTO[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  await connectDB();
  return serialize(await Skill.find().sort({ order: 1, name: 1 }).lean());
}

export async function getExperiences(): Promise<ExperienceDTO[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  await connectDB();
  const items = serialize<ExperienceDTO[]>(await Experience.find().lean());
  // Current roles first, then most recent start date; "order" breaks ties.
  return items.sort((a, b) => {
    if (!a.end !== !b.end) return a.end ? 1 : -1;
    return b.start.localeCompare(a.start) || a.order - b.order;
  });
}

export async function getProjects(): Promise<ProjectDTO[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  await connectDB();
  return serialize(await Project.find({ published: true }).sort({ order: 1, year: -1 }).lean());
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  await connectDB();
  const doc = await Project.findOne({ slug, published: true }).lean();
  return doc ? serialize(doc) : null;
}

/** Ranks other projects by shared tags, then recency. */
export async function getSimilarProjects(project: ProjectDTO, limit = 3): Promise<ProjectDTO[]> {
  const all = await getProjects();
  const tags = new Set(project.tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => tags.has(t.toLowerCase())).length }))
    .sort((a, b) => b.score - a.score || b.p.year - a.p.year)
    .slice(0, limit)
    .map(({ p }) => p);
}
