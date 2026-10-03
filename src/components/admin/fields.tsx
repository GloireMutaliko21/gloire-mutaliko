"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus, X } from "lucide-react";
import type { L10n } from "@/lib/i18n";
import type { ActionResult } from "@/lib/types";
import { buttonClass, inputClass } from "./styles";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-danger">{error}</span>}
    </label>
  );
}

/** One input per language, side by side. */
export function L10nField({
  label,
  value,
  onChange,
  multiline,
  rows = 4,
  hint,
  error,
}: {
  label: string;
  value: L10n;
  onChange: (v: L10n) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-1.5 grid gap-3 md:grid-cols-2">
        {(["en", "fr"] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute right-2 top-2 rounded-[2px] bg-paper px-1 text-[10px] font-medium uppercase text-muted">
              {lang}
            </span>
            {multiline ? (
              <textarea
                aria-label={`${label} (${lang})`}
                value={value?.[lang] ?? ""}
                rows={rows}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                className={`${inputClass} mt-0 resize-y pr-9`}
                aria-invalid={!!error}
              />
            ) : (
              <input
                aria-label={`${label} (${lang})`}
                value={value?.[lang] ?? ""}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                className={`${inputClass} mt-0 pr-9`}
                aria-invalid={!!error}
              />
            )}
          </div>
        ))}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </fieldset>
  );
}

/** Free-form list of short strings (tags, stack), entered with Enter or comma. */
export function TagInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const items = draft
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s));
    if (items.length) onChange([...value, ...items]);
    setDraft("");
  };
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-[4px] border border-line-strong bg-surface p-1.5 focus-within:border-accent">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-[3px] bg-accent-wash py-0.5 pl-2 pr-1 text-sm text-accent">
            {tag}
            <button type="button" aria-label={`Retirer ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="rounded-[2px] p-0.5 hover:bg-accent hover:text-white">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          aria-label={label}
          value={draft}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-[0.95rem] outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-muted">Entrée ou virgule pour ajouter.</p>
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Save bar pinned to the bottom of long forms, with the last result. */
export function SaveBar({ pending, result, label = "Enregistrer", children }: { pending: boolean; result: ActionResult<unknown> | null; label?: string; children?: ReactNode }) {
  const [visible, setVisible] = useState<ActionResult<unknown> | null>(null);
  useEffect(() => {
    setVisible(result);
    if (result?.ok) {
      const id = setTimeout(() => setVisible(null), 3500);
      return () => clearTimeout(id);
    }
  }, [result]);

  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-10 flex flex-wrap items-center gap-3 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
      <button type="submit" disabled={pending} className={buttonClass.primary}>
        {pending ? "Enregistrement…" : label}
      </button>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.p
            key={JSON.stringify(visible)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role={visible.ok ? "status" : "alert"}
            className={`flex items-center gap-1.5 text-sm ${visible.ok ? "text-success" : "text-danger"}`}
          >
            {visible.ok && <Check size={15} aria-hidden />}
            {visible.ok ? (visible.message ?? "Enregistré") : visible.error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={buttonClass.secondary}>
      <Plus size={15} aria-hidden />
      {children}
    </button>
  );
}

/** Two-step delete: first click arms, second click confirms. */
export function ConfirmButton({ onConfirm, label = "Supprimer", confirmLabel = "Confirmer la suppression", disabled }: { onConfirm: () => void; label?: string; confirmLabel?: string; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      className={armed ? `${buttonClass.danger} bg-danger text-white` : buttonClass.danger}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
