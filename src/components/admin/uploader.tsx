"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, ImagePlus, Trash2, Upload } from "lucide-react";
import { getUploadUrl } from "@/app/admin/actions";
import { browserClient } from "@/lib/supabase/browser";
import type { Asset } from "@/lib/types";
import { buttonClass, inputClass } from "./styles";

type Uploaded = { url: string; path: string; width?: number; height?: number };

function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return Promise.resolve({});
  return createImageBitmap(file)
    .then((bitmap) => {
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    })
    .catch(() => ({}));
}

/** Sends a file straight to the Supabase Storage bucket through a signed upload URL. */
async function uploadToBucket(file: File, folder: string): Promise<Uploaded> {
  if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} dépasse 10 Mo.`);
  const signed = await getUploadUrl(folder, file.name);
  if (!signed.ok) throw new Error(signed.error);
  const { bucket, path, token, publicUrl } = signed.data;
  const [{ error }, size] = await Promise.all([
    browserClient().storage.from(bucket).uploadToSignedUrl(path, token, file, { contentType: file.type }),
    imageSize(file),
  ]);
  if (error) throw new Error(error.message || "Échec de l’envoi");
  return { url: publicUrl, path, ...size };
}

/** Ordered image list with direct uploads to the Storage bucket, reordering and per-language alt text. */
export function ImagesField({ value, onChange, max = 10, folder = "projects" }: { value: Asset[]; onChange: (v: Asset[]) => void; max?: number; folder?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const remaining = max - value.length;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const picked = [...files].slice(0, remaining);
    if (files.length > remaining) setError(`${max} images maximum : ${files.length - remaining} fichier(s) ignoré(s).`);
    setBusy(picked.length);
    const added: Asset[] = [];
    for (const file of picked) {
      try {
        const up = await uploadToBucket(file, folder);
        added.push({ ...up, alt: { en: "", fr: "" } });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Échec de l’envoi");
      }
      setBusy((b) => b - 1);
    }
    onChange([...value, ...added]);
    if (input.current) input.current.value = "";
  };

  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Images</span>
        <span className="text-xs tabular-nums text-muted">
          {value.length} / {max} · la première sert de couverture
        </span>
      </div>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {value.map((img, i) => (
          <li key={img.url} className="overflow-hidden rounded-[6px] border border-line bg-surface">
            <div className="relative aspect-[16/10] bg-paper">
              <Image src={img.url} alt="" fill sizes="300px" className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-[3px] bg-ink px-1.5 py-0.5 text-[11px] text-paper">Couverture</span>}
            </div>
            <div className="space-y-2 p-2.5">
              {(["en", "fr"] as const).map((lang) => (
                <input
                  key={lang}
                  aria-label={`Texte alternatif ${lang}`}
                  placeholder={`Alt (${lang})`}
                  value={img.alt?.[lang] ?? ""}
                  onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, alt: { en: "", fr: "", ...v.alt, [lang]: e.target.value } } : v)))}
                  className={`${inputClass} mt-0 py-1.5 text-sm`}
                />
              ))}
              <div className="flex items-center justify-between">
                <div className="flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Déplacer vers la gauche" className={`${buttonClass.ghost} disabled:opacity-30`}>
                    <ArrowLeft size={15} />
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Déplacer vers la droite" className={`${buttonClass.ghost} disabled:opacity-30`}>
                    <ArrowRight size={15} />
                  </button>
                </div>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Retirer l’image" className={`${buttonClass.ghost} hover:text-danger`}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </li>
        ))}
        {remaining > 0 && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy > 0}
              className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed border-line-strong text-sm text-muted hover:border-accent hover:text-accent disabled:opacity-60"
            >
              <ImagePlus size={22} aria-hidden />
              {busy > 0 ? `Envoi de ${busy} image(s)…` : "Ajouter des images"}
            </button>
          </li>
        )}
      </ul>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function SingleImageField({ label, value, onChange, folder }: { label: string; value: Asset | null; onChange: (v: Asset | null) => void; folder: string }) {
  return (
    <ImagesField
      value={value ? [value] : []}
      onChange={(v) => onChange(v[0] ?? null)}
      max={1}
      folder={folder}
      key={label}
    />
  );
}

export function FileField({
  label,
  value,
  onChange,
  folder,
  accept = "application/pdf",
}: {
  label: string;
  value: { url: string; path: string; fileName: string } | null;
  onChange: (v: { url: string; path: string; fileName: string } | null) => void;
  folder: string;
  accept?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const up = await uploadToBucket(file, folder);
      onChange({ url: up.url, path: up.path, fileName: file.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l’envoi");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-[4px] border border-line-strong bg-surface p-3">
        <FileText size={18} className="text-muted" aria-hidden />
        {value ? (
          <a href={value.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 hover:text-accent">
            {value.fileName || "Fichier actuel"}
          </a>
        ) : (
          <span className="text-sm text-muted">Aucun fichier</span>
        )}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className={buttonClass.secondary}>
            <Upload size={14} aria-hidden />
            {busy ? "Envoi…" : value ? "Remplacer" : "Envoyer"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className={buttonClass.ghost}>
              Retirer
            </button>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
