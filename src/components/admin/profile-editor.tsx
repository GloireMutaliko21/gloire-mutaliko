"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { saveProfile } from "@/app/admin/actions";
import type { ActionResult, ProfileDTO } from "@/lib/types";
import { AddButton, Field, L10nField, SaveBar, Toggle } from "./fields";
import { FileField, SingleImageField } from "./uploader";
import { buttonClass, cardClass, inputClass } from "./styles";

export function ProfileEditor({ initial }: { initial: ProfileDTO }) {
  const [p, setP] = useState(initial);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const set = <K extends keyof ProfileDTO>(key: K, value: ProfileDTO[K]) => setP((prev) => ({ ...prev, [key]: value }));
  const err = (k: string) => (result && !result.ok ? result.fieldErrors?.[k]?.[0] : undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, updatedAt, ...data } = p;
          setResult(await saveProfile(data));
        });
      }}
      className="space-y-8"
    >
      <section className={`${cardClass} space-y-6 p-5 md:p-6`}>
        <h2 className="font-medium">Identité</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nom" error={err("name")}>
            <input value={p.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required />
          </Field>
          <Field label="E-mail public" error={err("email")} hint="Affiché sur la page contact.">
            <input type="email" value={p.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <L10nField label="Poste" value={p.role} onChange={(v) => set("role", v)} />
        <L10nField label="Accroche" value={p.headline} onChange={(v) => set("headline", v)} multiline rows={2} hint="Une phrase sous le nom, dans le haut de page." />
        <L10nField label="À propos" value={p.bio} onChange={(v) => set("bio", v)} multiline rows={8} hint="Séparez les paragraphes par une ligne vide." />
        <div className="grid gap-5 md:grid-cols-2">
          <L10nField label="Localisation" value={p.location} onChange={(v) => set("location", v)} />
          <Field label="Années d’expérience" error={err("yearsOfExperience")}>
            <input type="number" min={0} max={60} value={p.yearsOfExperience} onChange={(e) => set("yearsOfExperience", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className={`${cardClass} space-y-6 p-5 md:p-6`}>
        <h2 className="font-medium">Disponibilité et prise de contact</h2>
        <Toggle label="Disponible pour de nouveaux projets" checked={p.available} onChange={(v) => set("available", v)} />
        <L10nField label="Message de disponibilité" value={p.availability} onChange={(v) => set("availability", v)} hint="Facultatif. Remplace le texte par défaut du badge." />
        <Field label="Lien Cal.com" error={err("calLink")} hint="Votre identifiant et votre événement, par exemple gloire/30min. Vide = pas de réservation.">
          <div className="mt-1.5 flex items-stretch">
            <span className="flex items-center rounded-l-[4px] border border-r-0 border-line-strong bg-paper px-3 text-sm text-muted">cal.com/</span>
            <input value={p.calLink} onChange={(e) => set("calLink", e.target.value.trim())} className={`${inputClass} mt-0 rounded-l-none`} />
          </div>
        </Field>
      </section>

      <section className={`${cardClass} space-y-6 p-5 md:p-6`}>
        <h2 className="font-medium">Fichiers</h2>
        <FileField label="CV (PDF)" value={p.cv} onChange={(v) => set("cv", v)} folder="portfolio/cv" />
        <SingleImageField label="Photo" value={p.avatar} onChange={(v) => set("avatar", v)} folder="portfolio/profile" />
      </section>

      <section className={`${cardClass} space-y-4 p-5 md:p-6`}>
        <h2 className="font-medium">Réseaux</h2>
        {p.socials.map((s, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <Field label="Libellé">
              <input value={s.label} onChange={(e) => set("socials", p.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={inputClass} placeholder="GitHub" />
            </Field>
            <div className="min-w-[16rem] flex-1">
              <Field label="URL">
                <input type="url" value={s.url} onChange={(e) => set("socials", p.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} className={inputClass} placeholder="https://" />
              </Field>
            </div>
            <button type="button" aria-label={`Retirer ${s.label || "ce lien"}`} onClick={() => set("socials", p.socials.filter((_, j) => j !== i))} className={`${buttonClass.ghost} mb-1 hover:text-danger`}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <AddButton onClick={() => set("socials", [...p.socials, { label: "", url: "" }])}>Ajouter un lien</AddButton>
      </section>

      <SaveBar pending={pending} result={result} />
    </form>
  );
}
