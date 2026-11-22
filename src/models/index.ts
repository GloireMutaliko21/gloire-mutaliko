import mongoose, { Schema, type Model } from "mongoose";

const l10n = {
  en: { type: String, default: "" },
  fr: { type: String, default: "" },
};
const L10nSchema = new Schema(l10n, { _id: false });

const AssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    width: Number,
    height: Number,
    alt: { type: L10nSchema, default: () => ({}) },
  },
  { _id: false },
);

/* Content */

const ProfileSchema = new Schema(
  {
    name: { type: String, default: "" },
    role: { type: L10nSchema, default: () => ({}) },
    headline: { type: L10nSchema, default: () => ({}) },
    bio: { type: L10nSchema, default: () => ({}) },
    location: { type: L10nSchema, default: () => ({}) },
    email: { type: String, default: "" },
    yearsOfExperience: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    availability: { type: L10nSchema, default: () => ({}) },
    avatar: { type: AssetSchema, default: null },
    cv: {
      type: new Schema({ url: String, publicId: String, fileName: String }, { _id: false }),
      default: null,
    },
    socials: { type: [new Schema({ label: String, url: String }, { _id: false })], default: [] },
    calLink: { type: String, default: "" },
  },
  { timestamps: true },
);

export const SKILL_CATEGORIES = ["frontend", "backend", "devops", "data", "tools"] as const;

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: SKILL_CATEGORIES, default: "frontend" },
    level: { type: Number, min: 1, max: 5, default: 3 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    companyUrl: { type: String, default: "" },
    role: { type: L10nSchema, default: () => ({}) },
    location: { type: L10nSchema, default: () => ({}) },
    start: { type: String, required: true }, // YYYY-MM
    end: { type: String, default: null }, // YYYY-MM, null = current
    summary: { type: L10nSchema, default: () => ({}) },
    highlights: { type: [L10nSchema], default: [] },
    stack: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const MAX_PROJECT_IMAGES = 10;

const ProjectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: L10nSchema, default: () => ({}) },
    summary: { type: L10nSchema, default: () => ({}) },
    description: { type: L10nSchema, default: () => ({}) },
    images: {
      type: [AssetSchema],
      default: [],
      validate: [(v: unknown[]) => v.length <= MAX_PROJECT_IMAGES, "A project holds 10 images at most"],
    },
    tags: { type: [String], default: [], index: true },
    liveUrl: { type: String, default: "" },
    repoUrl: { type: String, default: "" },
    year: { type: Number, default: () => new Date().getFullYear() },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

/* Inbox and analytics */

const MessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: "" },
    body: { type: String, required: true },
    locale: { type: String, default: "en" },
    country: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

const PageViewSchema = new Schema({
  path: { type: String, required: true },
  locale: { type: String, default: "" },
  country: { type: String, default: "" },
  visitor: { type: String, required: true },
  referrer: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, index: true },
});
PageViewSchema.index({ path: 1, createdAt: -1 });

const DownloadSchema = new Schema({
  kind: { type: String, default: "cv" },
  locale: { type: String, default: "" },
  country: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, index: true },
});

/* Versioning */

export const VERSIONED_ENTITIES = ["profile", "skill", "experience", "project"] as const;
export type VersionedEntity = (typeof VERSIONED_ENTITIES)[number];

const RevisionSchema = new Schema({
  entity: { type: String, enum: VERSIONED_ENTITIES, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  version: { type: Number, required: true },
  action: { type: String, enum: ["create", "update", "delete", "restore"], required: true },
  label: { type: String, default: "" },
  restoredFrom: { type: Number, default: null },
  snapshot: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});
RevisionSchema.index({ entity: 1, entityId: 1, version: -1 });
RevisionSchema.index({ createdAt: -1 });

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const Profile = model("Profile", ProfileSchema);
export const Skill = model("Skill", SkillSchema);
export const Experience = model("Experience", ExperienceSchema);
export const Project = model("Project", ProjectSchema);
export const Message = model("Message", MessageSchema);
export const PageView = model("PageView", PageViewSchema);
export const Download = model("Download", DownloadSchema);
export const Revision = model("Revision", RevisionSchema);

export const entityModels = {
  profile: Profile,
  skill: Skill,
  experience: Experience,
  project: Project,
} as const;
