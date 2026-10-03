"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Reply } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/app/admin/actions";
import type { MessageDTO } from "@/lib/types";
import { ConfirmButton } from "./fields";
import { buttonClass, cardClass } from "./styles";

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const regions = new Intl.DisplayNames(["fr"], { type: "region" });

export function MessagesList({ messages }: { messages: MessageDTO[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (messages.length === 0) {
    return <p className="text-muted">Aucun message ici. Les messages du formulaire de contact arriveront dans cette liste.</p>;
  }

  return (
    <ul className={`${cardClass} divide-y divide-line`}>
      {messages.map((m) => {
        const expanded = open === m.id;
        return (
          <li key={m.id} className={m.read ? "" : "bg-accent-wash/40"}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => {
                setOpen(expanded ? null : m.id);
                if (!m.read && !expanded) start(() => setMessageRead(m.id, true).then(() => {}));
              }}
              className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-paper"
            >
              {m.read ? <MailOpen size={17} className="mt-0.5 shrink-0 text-muted" aria-label="Lu" /> : <Mail size={17} className="mt-0.5 shrink-0 text-accent" aria-label="Non lu" />}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className={m.read ? "" : "font-semibold"}>
                    {m.name}
                    {m.company && <span className="font-normal text-muted"> · {m.company}</span>}
                  </span>
                  <time dateTime={m.createdAt} className="text-xs tabular-nums text-muted">
                    {fmt.format(new Date(m.createdAt))}
                  </time>
                </span>
                <span className={`mt-0.5 block text-sm text-muted ${expanded ? "" : "truncate"}`}>{expanded ? m.email : m.body}</span>
              </span>
            </button>
            {expanded && (
              <div className="px-5 pb-5 pl-[3.25rem]">
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <p className="mt-4 text-xs text-muted">
                  Langue : {m.locale.toUpperCase()}
                  {m.country && ` · Pays : ${regions.of(m.country) ?? m.country}`}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(m.locale === "fr" ? "Re : votre message" : "Re: your message")}`} className={buttonClass.primary}>
                    <Reply size={15} aria-hidden /> Répondre
                  </a>
                  <button type="button" disabled={pending} onClick={() => start(() => setMessageRead(m.id, !m.read).then(() => {}))} className={buttonClass.secondary}>
                    {m.read ? "Marquer non lu" : "Marquer lu"}
                  </button>
                  <ConfirmButton label="Supprimer" confirmLabel="Supprimer définitivement" disabled={pending} onConfirm={() => start(() => deleteMessage(m.id).then(() => setOpen(null)))} />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
