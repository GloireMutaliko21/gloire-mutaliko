"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteExperience, saveExperience } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/types";
import type { ExperienceDraft } from "./defaults";
import { AddButton, ConfirmButton, Field, L10nField, SaveBar, TagInput, Toggle } from "./fields";
import { buttonClass, cardClass, inputClass } from "./styles";

export function ExperienceEditor({ initial }: { initial: ExperienceDraft }) {
  const router = useRouter();
  const [x, setX] = useState(initial);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const set = <K extends keyof ExperienceDraft>(k: K, v: ExperienceDraft[K]) => setX((p) => ({ ...p, [k]: v }));
  const err = (k: string) => (result && !result.ok ? result.fieldErrors?.[k]?.[0] : undefined);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveExperience(x);
          setResult(res);
          if (res.ok && !x._id) router.replace(`/admin/experience/${res.data!.id}`);
        });
      }}
    >
      <section className={`${cardClass} space-y-6 p-5 md:p-6`}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Entreprise" error={err("company")}>
            <input value={x.company} onChange={(e) => set("company", e.target.value)} className={inputClass} required />
          </Field>
          <Field label="Site de l’entreprise" error={err("companyUrl")}>
            <input type="url" value={x.companyUrl} onChange={(e) => set("companyUrl", e.target.value)} className={inputClass} placeholder="https://" />
          </Field>
        </div>
        <L10nField label="Poste" value={x.role} onChange={(v) => set("role", v)} error={err("role")} />
        <L10nField label="Lieu" value={x.location} onChange={(v) => set("location", v)} hint="Par exemple : Paris, hybride." />
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Début" error={err("start")}>
            <input type="month" value={x.start} onChange={(e) => set("start", e.target.value)} className={inputClass} required />
          </Field>
          <Field label="Fin" error={err("end")}>
            <input type="month" value={x.end ?? ""} disabled={x.end === null} onChange={(e) => set("end", e.target.value || null)} className={`${inputClass} disabled:opacity-50`} />
          </Field>
          <div className="md:pt-7">
            <Toggle label="Poste actuel" checked={x.end === null} onChange={(v) => set("end", v ? null : x.start || "")} />
          </div>
        </div>
        <L10nField label="Résumé" value={x.summary} onChange={(v) => set("summary", v)} multiline rows={3} />
      </section>

      <section className={`${cardClass} space-y-4 p-5 md:p-6`}>
        <h2 className="font-medium">Réalisations</h2>
        {x.highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <L10nField label={`Réalisation ${i + 1}`} value={h} onChange={(v) => set("highlights", x.highlights.map((y, j) => (j === i ? v : y)))} multiline rows={2} />
            </div>
            <button type="button" aria-label={`Retirer la réalisation ${i + 1}`} onClick={() => set("highlights", x.highlights.filter((_, j) => j !== i))} className={`${buttonClass.ghost} mt-7 hover:text-danger`}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {x.highlights.length < 10 && (
          <AddButton onClick={() => set("highlights", [...x.highlights, { en: "", fr: "" }])}>Ajouter une réalisation</AddButton>
        )}
      </section>

      <section className={`${cardClass} space-y-5 p-5 md:p-6`}>
        <TagInput label="Stack" value={x.stack} onChange={(v) => set("stack", v)} placeholder="React, NestJS…" />
        <Field label="Ordre" hint="Départage deux postes commencés le même mois.">
          <input type="number" value={x.order} onChange={(e) => set("order", Number(e.target.value))} className={`${inputClass} max-w-[8rem]`} />
        </Field>
      </section>

      <SaveBar pending={pending} result={result}>
        {x._id && (
          <div className="ml-auto">
            <ConfirmButton
              onConfirm={() =>
                start(async () => {
                  const res = await deleteExperience(x._id!);
                  if (res.ok) router.push("/admin/experience");
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
