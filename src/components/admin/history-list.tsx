"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { restoreVersion } from "@/app/admin/actions";
import type { RevisionDTO } from "@/lib/types";
import { ENTITY_LABELS } from "./labels";
import { buttonClass, cardClass } from "./styles";

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });


const ACTION_LABELS: Record<RevisionDTO["action"], { label: string; className: string }> = {
  create: { label: "Création", className: "text-success" },
  update: { label: "Modification", className: "text-ink" },
  delete: { label: "Suppression", className: "text-danger" },
  restore: { label: "Restauration", className: "text-accent" },
};

/** Fields that changed between this snapshot and the previous version of the same document. */
function changedFields(rev: RevisionDTO, previous?: RevisionDTO) {
  if (!previous || rev.action === "delete") return [];
  const ignore = new Set(["id", "createdAt", "updatedAt"]);
  const keys = new Set([...Object.keys(rev.snapshot), ...Object.keys(previous.snapshot)]);
  return [...keys].filter((k) => !ignore.has(k) && JSON.stringify(rev.snapshot[k]) !== JSON.stringify(previous.snapshot[k]));
}

export function HistoryList({ revisions, latestVersion }: { revisions: RevisionDTO[]; latestVersion: Record<string, number> }) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  if (revisions.length === 0) {
    return <p className="text-muted">Aucune version pour l’instant. Chaque enregistrement dans l’administration en créera une.</p>;
  }

  const byDoc = new Map<string, RevisionDTO[]>();
  revisions.forEach((r) => byDoc.set(r.entityId, [...(byDoc.get(r.entityId) ?? []), r]));

  return (
    <ol className={`${cardClass} divide-y divide-line`}>
      {revisions.map((rev) => {
        const siblings = byDoc.get(rev.entityId) ?? [];
        const previous = siblings.find((s) => s.version === rev.version - 1);
        const changes = changedFields(rev, previous);
        const isCurrent = latestVersion[rev.entityId] === rev.version && rev.action !== "delete";
        const action = ACTION_LABELS[rev.action];
        return (
          <li key={rev.id} className="px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p>
                  <span className="text-muted">{ENTITY_LABELS[rev.entity]} · </span>
                  <span className="font-medium">{rev.label || "Sans titre"}</span>
                  <span className="ml-2 rounded-[3px] border border-line px-1.5 py-px text-xs tabular-nums text-muted">v{rev.version}</span>
                  {isCurrent && <span className="ml-1.5 rounded-[3px] bg-accent-wash px-1.5 py-px text-xs text-accent">en ligne</span>}
                </p>
                <p className="mt-1 text-sm">
                  <span className={action.className}>{action.label}</span>
                  {rev.action === "restore" && rev.restoredFrom && <span className="text-muted"> de la v{rev.restoredFrom}</span>}
                  <span className="text-muted"> · {fmt.format(new Date(rev.createdAt))}</span>
                </p>
                {changes.length > 0 && <p className="mt-1 text-xs text-muted">Champs modifiés : {changes.join(", ")}</p>}
              </div>
              {!isCurrent && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setBusy(rev.id);
                    start(async () => {
                      const res = await restoreVersion(rev.id);
                      setFeedback({ id: rev.id, ok: res.ok, text: res.ok ? "Version restaurée" : res.error });
                      setBusy(null);
                    });
                  }}
                  className={buttonClass.secondary}
                >
                  <RotateCcw size={14} aria-hidden />
                  {busy === rev.id ? "Restauration…" : rev.action === "delete" ? "Recréer" : "Restaurer cette version"}
                </button>
              )}
            </div>
            {feedback?.id === rev.id && (
              <p role="status" className={`mt-2 text-sm ${feedback.ok ? "text-success" : "text-danger"}`}>
                {feedback.text}
              </p>
            )}
            <details className="mt-2">
              <summary className="text-xs text-muted hover:text-ink">Voir le contenu de cette version</summary>
              <pre className="mt-2 max-h-80 overflow-auto rounded-[4px] bg-paper p-3 text-xs leading-relaxed">{JSON.stringify(rev.snapshot, null, 2)}</pre>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
