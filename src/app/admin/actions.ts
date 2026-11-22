"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { Types } from "mongoose";
import { z } from "zod";
import { endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { cloudinaryConfigured, signUploadParams, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/cloudinary";
import { CONTENT_TAG } from "@/lib/content";
import { connectDB } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { experienceInput, profileInput, projectInput, skillInput } from "@/lib/schemas";
import type { ActionResult } from "@/lib/types";
import { recordRevision, restoreRevision } from "@/lib/versioning";
import { Experience, Message, Profile, Project, Skill, type VersionedEntity } from "@/models";

/* Auth */

export async function login(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000).ok) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const passwordOk = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);

  if (!expectedEmail || email !== expectedEmail || !passwordOk) {
    return { error: "E-mail ou mot de passe incorrect." };
  }
  await startAdminSession(email);
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

/* Helpers */

function invalid(error: z.ZodError): ActionResult<never> {
  const flat = z.flattenError(error);
  const first = flat.formErrors[0] ?? Object.values(flat.fieldErrors).flat()[0];
  return { ok: false, error: first ?? "Données invalides", fieldErrors: flat.fieldErrors as Record<string, string[]> };
}

function contentChanged() {
  updateTag(CONTENT_TAG);
  refresh();
}

function isId(id: unknown): id is string {
  return typeof id === "string" && Types.ObjectId.isValid(id);
}

async function saveVersioned<T extends { _id?: string }>(
  entity: VersionedEntity,
  Model: typeof Skill | typeof Experience | typeof Project,
  data: T,
  label: string,
) {
  const { _id, ...fields } = data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const M = Model as any;
  if (_id) {
    const doc = await M.findByIdAndUpdate(_id, fields, { returnDocument: "after", runValidators: true, overwrite: false }).lean();
    if (!doc) throw new Error("Élément introuvable");
    await recordRevision(entity, doc._id, "update", doc, label);
    return String(doc._id);
  }
  const doc = await M.create(fields);
  await recordRevision(entity, doc._id, "create", doc.toObject(), label);
  return String(doc._id);
}

async function deleteVersioned(entity: VersionedEntity, Model: typeof Skill | typeof Experience | typeof Project, id: string, label: (doc: Record<string, unknown>) => string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await (Model as any).findByIdAndDelete(id).lean();
  if (doc) await recordRevision(entity, doc._id, "delete", doc, label(doc));
}

function failure(error: unknown): ActionResult<never> {
  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    return { ok: false, error: "Cette valeur existe déjà (slug en double ?)." };
  }
  console.error(error);
  return { ok: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
}

/* Profile */

export async function saveProfile(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = profileInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await connectDB();
    const doc = await Profile.findOneAndUpdate({}, parsed.data, {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean();
    await recordRevision("profile", doc!._id, "update", doc, parsed.data.name);
    contentChanged();
    return { ok: true, message: "Profil enregistré" };
  } catch (error) {
    return failure(error);
  }
}

/* Skills */

export async function saveSkill(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = skillInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await connectDB();
    const id = await saveVersioned("skill", Skill, parsed.data, parsed.data.name);
    contentChanged();
    return { ok: true, data: { id }, message: "Compétence enregistrée" };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Identifiant invalide" };
  await connectDB();
  await deleteVersioned("skill", Skill, id, (d) => String(d.name));
  contentChanged();
  return { ok: true, message: "Compétence supprimée" };
}

/* Experience */

export async function saveExperience(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = experienceInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await connectDB();
    const id = await saveVersioned("experience", Experience, parsed.data, parsed.data.company);
    contentChanged();
    return { ok: true, data: { id }, message: "Expérience enregistrée" };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Identifiant invalide" };
  await connectDB();
  await deleteVersioned("experience", Experience, id, (d) => String(d.company));
  contentChanged();
  return { ok: true, message: "Expérience supprimée" };
}

/* Projects */

export async function saveProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = projectInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await connectDB();
    const id = await saveVersioned("project", Project, parsed.data, parsed.data.title.fr || parsed.data.title.en);
    contentChanged();
    return { ok: true, data: { id }, message: "Projet enregistré" };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Identifiant invalide" };
  await connectDB();
  await deleteVersioned("project", Project, id, (d) => {
    const title = d.title as { en?: string; fr?: string } | undefined;
    return title?.fr || title?.en || String(d.slug);
  });
  contentChanged();
  return { ok: true, message: "Projet supprimé" };
}

/* Versioning */

export async function restoreVersion(revisionId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isId(revisionId)) return { ok: false, error: "Identifiant invalide" };
  try {
    await restoreRevision(revisionId);
    contentChanged();
    return { ok: true, message: "Version restaurée" };
  } catch (error) {
    return failure(error);
  }
}

/* Inbox */

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Identifiant invalide" };
  await connectDB();
  await Message.updateOne({ _id: id }, { read });
  refresh();
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: "Identifiant invalide" };
  await connectDB();
  await Message.deleteOne({ _id: id });
  refresh();
  return { ok: true, message: "Message supprimé" };
}

/* Uploads */

export async function getUploadSignature(folder: string) {
  await requireAdmin();
  if (!cloudinaryConfigured()) {
    return { ok: false as const, error: "Cloudinary n’est pas configuré (variables CLOUDINARY_* manquantes)." };
  }
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
    return { ok: false as const, error: "Dossier non autorisé" };
  }
  return { ok: true as const, data: signUploadParams(folder as UploadFolder) };
}
