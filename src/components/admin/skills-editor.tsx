"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { deleteSkill, saveSkill } from "@/app/admin/actions";
import type { SkillCategory, SkillDTO } from "@/lib/types";
import { CATEGORY_COLORS } from "@/components/three/colors";
import { AddButton, ConfirmButton } from "./fields";
import { buttonClass, cardClass, inputClass } from "./styles";

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "devops", label: "Infrastructure" },
  { value: "data", label: "Données" },
  { value: "tools", label: "Outillage" },
];

type Row = Omit<SkillDTO, "_id"> & { _id?: string; key: string };

export function SkillsEditor({ initial }: { initial: SkillDTO[] }) {
  const [rows, setRows] = useState<Row[]>(initial.map((s) => ({ ...s, key: s._id })));

  return (
    <div className={`${cardClass} overflow-hidden`}>
      <div className="hidden grid-cols-[1fr_11rem_8rem_5rem_auto] gap-3 border-b border-line bg-paper px-4 py-2.5 text-xs text-muted md:grid">
        <span>Nom</span>
        <span>Catégorie</span>
        <span>Niveau (1 à 5)</span>
        <span>Ordre</span>
        <span className="w-[12.5rem]" />
      </div>
      <ul>
        {rows.map((row) => (
          <SkillRow
            key={row.key}
            row={row}
            onSaved={(saved) => setRows((r) => r.map((x) => (x.key === row.key ? saved : x)))}
            onDeleted={() => setRows((r) => r.filter((x) => x.key !== row.key))}
          />
        ))}
      </ul>
      <div className="border-t border-line p-4">
        <AddButton
          onClick={() =>
            setRows((r) => [
              ...r,
              { key: crypto.randomUUID(), name: "", category: "frontend", level: 3, order: (r.at(-1)?.order ?? 0) + 1 },
            ])
          }
        >
          Ajouter une compétence
        </AddButton>
      </div>
    </div>
  );
}

function SkillRow({ row, onSaved, onDeleted }: { row: Row; onSaved: (saved: Row) => void; onDeleted: () => void }) {
  const [draft, setDraft] = useState(row);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(row) || !row._id;

  const save = () =>
    start(async () => {
      const { key: _key, ...data } = draft;
      const res = await saveSkill({ ...data, _id: row._id });
      if (res.ok) {
        const saved = { ...draft, _id: res.data!.id };
        setDraft(saved);
        onSaved(saved);
        setStatus({ ok: true, text: "Enregistré" });
        setTimeout(() => setStatus(null), 2500);
      } else setStatus({ ok: false, text: res.error });
    });

  return (
    <li className="grid gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[1fr_11rem_8rem_5rem_auto] md:items-center">
      <input aria-label="Nom" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={`${inputClass} mt-0`} placeholder="TypeScript" />
      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLORS[draft.category] }} aria-hidden />
        <select aria-label="Catégorie" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as SkillCategory })} className={`${inputClass} mt-0`}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <input aria-label="Niveau" type="range" min={1} max={5} value={draft.level} onChange={(e) => setDraft({ ...draft, level: Number(e.target.value) })} className="accent-[var(--accent)]" />
      <input aria-label="Ordre" type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })} className={`${inputClass} mt-0`} />
      <div className="flex w-[12.5rem] items-center justify-end gap-2">
        {status && <span className={`text-xs ${status.ok ? "text-success" : "text-danger"}`} role="status">{status.ok ? <Check size={14} aria-label={status.text} /> : status.text}</span>}
        <button type="button" onClick={save} disabled={pending || !dirty || !draft.name.trim()} className={buttonClass.secondary}>
          {pending ? "…" : "Enregistrer"}
        </button>
        <ConfirmButton
          label="Suppr."
          confirmLabel="Sûr ?"
          disabled={pending}
          onConfirm={() =>
            row._id
              ? start(async () => {
                  const res = await deleteSkill(row._id!);
                  if (res.ok) onDeleted();
                })
              : onDeleted()
          }
        />
      </div>
    </li>
  );
}
