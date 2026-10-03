import "server-only";
import { randomUUID } from "node:crypto";
import { BUCKET, db } from "./supabase/server";

export const UPLOAD_FOLDERS = ["projects", "profile", "cv"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

function safeName(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

/**
 * Signed upload URL (Supabase Storage's native direct upload): the browser
 * sends the file straight to the bucket, the secret key stays on the server.
 */
export async function createUpload(folder: UploadFolder, fileName: string) {
  const path = `${folder}/${randomUUID().slice(0, 8)}-${safeName(fileName)}`;
  const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  const publicUrl = db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return { bucket: BUCKET, path: data.path, token: data.token, publicUrl };
}
