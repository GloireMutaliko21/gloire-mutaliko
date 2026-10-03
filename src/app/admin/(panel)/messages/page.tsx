import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { fromRows } from "@/lib/rows";
import { db, must } from "@/lib/supabase/server";
import type { MessageDTO } from "@/lib/types";
import { MessagesList } from "@/components/admin/messages-list";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const filter = (await searchParams).filter === "unread" ? "unread" : "all";
  let query = db().from("messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter === "unread") query = query.eq("read", false);
  const [messages, { count: unread }] = await Promise.all([
    query.then(must),
    db().from("messages").select("id", { count: "exact", head: true }).eq("read", false),
  ]);

  return (
    <>
      <PageHeader title="Messages" description="Envoyés depuis le formulaire de contact du site.">
        <div role="group" aria-label="Filtre" className="flex rounded-[4px] border border-line-strong bg-surface p-0.5 text-sm">
          {[
            { key: "all", label: "Tous" },
            { key: "unread", label: `Non lus (${unread ?? 0})` },
          ].map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/messages" : "/admin/messages?filter=unread"}
              aria-current={filter === f.key ? "true" : undefined}
              className={`rounded-[3px] px-3 py-1 ${filter === f.key ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </PageHeader>
      <MessagesList messages={fromRows<MessageDTO>(messages)} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
