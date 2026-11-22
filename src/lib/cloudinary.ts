import "server-only";
import { v2 as cloudinary } from "cloudinary";

export const UPLOAD_FOLDERS = ["portfolio/projects", "portfolio/profile", "portfolio/cv"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  );
}

/**
 * Signature for a direct browser upload (Cloudinary's signed upload flow).
 * The file never transits through our server, and the secret never leaves it.
 */
export function signUploadParams(folder: UploadFolder) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
