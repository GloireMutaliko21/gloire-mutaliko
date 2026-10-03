import type { ExperienceDTO, ProjectDTO } from "@/lib/types";

export type ExperienceDraft = Omit<ExperienceDTO, "_id"> & { _id?: string };

export const emptyExperience: ExperienceDraft = {
  company: "",
  companyUrl: "",
  role: { en: "", fr: "" },
  location: { en: "", fr: "" },
  start: "",
  end: null,
  summary: { en: "", fr: "" },
  highlights: [],
  stack: [],
  order: 0,
};

export type ProjectDraft = Omit<ProjectDTO, "_id"> & { _id?: string };

export const emptyProject = (): ProjectDraft => ({
  slug: "",
  title: { en: "", fr: "" },
  summary: { en: "", fr: "" },
  description: { en: "", fr: "" },
  images: [],
  tags: [],
  liveUrl: "",
  repoUrl: "",
  year: new Date().getFullYear(),
  featured: false,
  published: true,
  order: 0,
});
