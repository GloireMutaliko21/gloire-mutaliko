import { z } from "zod";

const text = (max = 400) => z.string().trim().max(max);
export const l10nSchema = (max = 400) => z.object({ en: text(max), fr: text(max) });
const url = z.union([z.literal(""), z.url({ protocol: /^https?$/ })]);
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format attendu : AAAA-MM");

export const assetSchema = z.object({
  url: z.url({ protocol: /^https$/ }),
  publicId: z.string().default(""),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: l10nSchema(200).optional(),
});

export const profileInput = z.object({
  name: text(80).min(1, "Nom requis"),
  role: l10nSchema(120),
  headline: l10nSchema(240),
  bio: l10nSchema(4000),
  location: l10nSchema(120),
  email: z.union([z.literal(""), z.email()]),
  yearsOfExperience: z.number().int().min(0).max(60),
  available: z.boolean(),
  availability: l10nSchema(160),
  avatar: assetSchema.nullable(),
  cv: z.object({ url: z.url(), publicId: z.string(), fileName: z.string() }).nullable(),
  socials: z.array(z.object({ label: text(40).min(1), url: z.url() })).max(12),
  calLink: text(200).regex(/^[\w\-/]*$/, "Exemple : gloire/30min"),
});

export const skillInput = z.object({
  _id: z.string().optional(),
  name: text(60).min(1, "Nom requis"),
  category: z.enum(["frontend", "backend", "devops", "data", "tools"]),
  level: z.number().int().min(1).max(5),
  order: z.number().int(),
});

export const experienceInput = z
  .object({
    _id: z.string().optional(),
    company: text(120).min(1, "Entreprise requise"),
    companyUrl: url,
    role: l10nSchema(120),
    location: l10nSchema(120),
    start: month,
    end: month.nullable(),
    summary: l10nSchema(1200),
    highlights: z.array(l10nSchema(300)).max(10),
    stack: z.array(text(40).min(1)).max(30),
    order: z.number().int(),
  })
  .refine((v) => !v.end || v.end >= v.start, { message: "La fin précède le début", path: ["end"] })
  .refine((v) => v.role.en || v.role.fr, { message: "Poste requis", path: ["role"] });

export const projectInput = z
  .object({
    _id: z.string().optional(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug requis")
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Minuscules, chiffres et tirets uniquement"),
    title: l10nSchema(120),
    summary: l10nSchema(300),
    description: l10nSchema(8000),
    images: z.array(assetSchema).max(10, "10 images maximum"),
    tags: z.array(text(30).min(1)).max(20),
    liveUrl: url,
    repoUrl: url,
    year: z.number().int().min(1990).max(2100),
    featured: z.boolean(),
    published: z.boolean(),
    order: z.number().int(),
  })
  .refine((v) => v.title.en || v.title.fr, { message: "Titre requis", path: ["title"] });

export const contactInput = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(160),
  company: z.string().trim().max(120).default(""),
  body: z.string().trim().min(10).max(4000),
  locale: z.enum(["en", "fr"]).default("en"),
});

export type ProfileInput = z.infer<typeof profileInput>;
export type SkillInput = z.infer<typeof skillInput>;
export type ExperienceInput = z.infer<typeof experienceInput>;
export type ProjectInput = z.infer<typeof projectInput>;
