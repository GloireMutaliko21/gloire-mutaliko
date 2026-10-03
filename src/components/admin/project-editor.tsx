"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { deleteProject, saveProject } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/types";
import type { ProjectDraft } from "./defaults";
import { ConfirmButton, Field, L10nField, SaveBar, TagInput, Toggle } from "./fields";
import { ImagesField } from "./uploader";
import { cardClass, inputClass } from "./styles";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ProjectEditor({ initial }: { initial: ProjectDraft }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => setP((prev) => ({ ...prev, [k]: v }));
  const err = (k: string) => (result && !result.ok ? result.fieldErrors?.[k]?.[0] : undefined);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveProject(p);
          setResult(res);
          if (res.ok && !p.id) router.replace(`/admin/projects/${res.data!.id}`);
        });
      }}
    >
      <section className={`${cardClass} space-y-6 p-5 md:p-6`}>
        <L10nField
          label="Titre"
          value={p.title}
          error={err("title")}
          onChange={(v) => {
            setP((prev) => ({ ...prev, title: v, slug: slugTouched ? prev.slug : slugify(v.en || v.fr) }));
          }}
        />
        <Field label="Slug (adresse de la page)" error={err("slug")} hint={`/projects/${p.slug || "…"}`}>
          <input
            value={p.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            className={inputClass}
            required
          />
        </Field>
        <L10nField label="Résumé" value={p.summary} onChange={(v) => set("summary", v)} multiline rows={2} hint="Deux phrases au plus, affichées sur les cartes." />
        <L10nField label="Description" value={p.description} onChange={(v) => set("description", v)} multiline rows={10} hint="Séparez les paragraphes par une ligne vide." />
      </section>

      <section className={`${cardClass} p-5 md:p-6`}>
        <ImagesField value={p.images} onChange={(v) => set("images", v)} />
        {err("images") && <p className="mt-2 text-xs text-danger">{err("images")}</p>}
      </section>

      <section className={`${cardClass} space-y-6 p-5 md:p-6`}>
        <TagInput label="Tags" value={p.tags} onChange={(v) => set("tags", v)} placeholder="Next.js, NestJS, MongoDB…" />
        <p className="-mt-3 text-xs text-muted">Les projets similaires sont choisis selon les tags en commun.</p>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Site en ligne" error={err("liveUrl")}>
            <input type="url" value={p.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} className={inputClass} placeholder="https://" />
          </Field>
          <Field label="Dépôt de code" error={err("repoUrl")}>
            <input type="url" value={p.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} className={inputClass} placeholder="https://github.com/…" />
          </Field>
          <Field label="Année" error={err("year")}>
            <input type="number" value={p.year} onChange={(e) => set("year", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Ordre" hint="Plus petit = affiché en premier.">
            <input type="number" value={p.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-8">
          <Toggle label="Publié" checked={p.published} onChange={(v) => set("published", v)} hint="Visible sur le site public." />
          <Toggle label="À la une" checked={p.featured} onChange={(v) => set("featured", v)} hint="Affiché sur l’accueil (4 au plus)." />
        </div>
      </section>

      <SaveBar pending={pending} result={result}>
        {p.id && p.published && (
          <a href={`/fr/projects/${initial.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            Voir la page <ExternalLink size={13} aria-hidden />
          </a>
        )}
        {p.id && (
          <div className="ml-auto">
            <ConfirmButton
              onConfirm={() =>
                start(async () => {
                  const res = await deleteProject(p.id!);
                  if (res.ok) router.push("/admin/projects");
                  else setResult(res);
                })
              }
            />
          </div>
        )}
      </SaveBar>
    </form>
  );
}
