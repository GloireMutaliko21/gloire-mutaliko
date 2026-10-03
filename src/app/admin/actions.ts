"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { toRow } from "@/lib/rows";
import { experienceInput, profileInput, projectInput, skillInput } from "@/lib/schemas";
import { createUpload, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/storage";
import { db, must } from "@/lib/supabase/server";
import type { ActionResult, VersionedEntity } from "@/lib/types";
import { ENTITY_TABLES, recordRevision, restoreRevision } from "@/lib/versioning";

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

const uuid = z.uuid();

function invalid(error: z.ZodError): ActionResult<never> {
  const flat = z.flattenError(error);
  const first = flat.formErrors[0] ?? Object.values(flat.fieldErrors).flat()[0];
  return { ok: false, error: first ?? "Données invalides", fieldErrors: flat.fieldErrors as Record<string, string[]> };
}

function contentChanged() {
  updateTag(CONTENT_TAG);
  refresh();
}

function failure(error: unknown): ActionResult<never> {
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return { ok: false, error: "Cette valeur existe déjà (slug en double ?)." };
  }
  console.error(error);
  return { ok: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
}

/** Inserts or updates a row, then records the new state as a version. */
async function saveVersioned(entity: VersionedEntity, data: { id?: string } & Record<string, unknown>, label: string) {
  const { id, ...fields } = data;
  const table = db().from(ENTITY_TABLES[entity]);
  const row = id
    ? must(await table.update(toRow(fields)).eq("id", id).select().maybeSingle())
    : must(await table.insert(toRow(fields)).select().single());
  if (!row) throw new Error("Élément introuvable");
  await recordRevision(entity, row.id, id ? "update" : "create", row, label);
  return row.id as string;
}

/** Deletes a row and keeps its last state as a "delete" version, so it can be recreated. */
async function deleteVersioned(entity: VersionedEntity, id: string, label: (row: Record<string, unknown>) => string) {
  const row = must(await db().from(ENTITY_TABLES[entity]).delete().eq("id", id).select().maybeSingle());
  if (row) await recordRevision(entity, row.id, "delete", row, label(row));
}

/* Profile */

export async function saveProfile(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = profileInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const existing = must(await db().from("profile").select("id").order("created_at").limit(1).maybeSingle());
    await saveVersioned("profile", { ...parsed.data, id: existing?.id }, parsed.data.name);
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
    const id = await saveVersioned("skill", parsed.data, parsed.data.name);
    contentChanged();
    return { ok: true, data: { id }, message: "Compétence enregistrée" };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Identifiant invalide" };
  try {
    await deleteVersioned("skill", id, (r) => String(r.name));
    contentChanged();
    return { ok: true, message: "Compétence supprimée" };
  } catch (error) {
    return failure(error);
  }
}

/* Experience */

export async function saveExperience(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = experienceInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const id = await saveVersioned("experience", parsed.data, parsed.data.company);
    contentChanged();
    return { ok: true, data: { id }, message: "Expérience enregistrée" };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Identifiant invalide" };
  try {
    await deleteVersioned("experience", id, (r) => String(r.company));
    contentChanged();
    return { ok: true, message: "Expérience supprimée" };
  } catch (error) {
    return failure(error);
  }
}

/* Projects */

export async function saveProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = projectInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const id = await saveVersioned("project", parsed.data, parsed.data.title.fr || parsed.data.title.en);
    contentChanged();
    return { ok: true, data: { id }, message: "Projet enregistré" };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Identifiant invalide" };
  try {
    await deleteVersioned("project", id, (r) => {
      const title = r.title as { en?: string; fr?: string } | undefined;
      return title?.fr || title?.en || String(r.slug);
    });
    contentChanged();
    return { ok: true, message: "Projet supprimé" };
  } catch (error) {
    return failure(error);
  }
}

/* Versioning */

export async function restoreVersion(revisionId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(revisionId).success) return { ok: false, error: "Identifiant invalide" };
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
  if (!uuid.safeParse(id).success) return { ok: false, error: "Identifiant invalide" };
  must(await db().from("messages").update({ read }).eq("id", id));
  refresh();
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Identifiant invalide" };
  must(await db().from("messages").delete().eq("id", id));
  refresh();
  return { ok: true, message: "Message supprimé" };
}

/* Uploads */

export async function getUploadUrl(folder: string, fileName: string) {
  await requireAdmin();
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
    return { ok: false as const, error: "Dossier non autorisé" };
  }
  try {
    return { ok: true as const, data: await createUpload(folder as UploadFolder, fileName) };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Envoi impossible" };
  }
}
