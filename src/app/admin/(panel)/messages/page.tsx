import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/db";
import type { MessageDTO } from "@/lib/types";
import { Message } from "@/models";
import { MessagesList } from "@/components/admin/messages-list";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const filter = (await searchParams).filter === "unread" ? "unread" : "all";
  await connectDB();
  const [messages, unread] = await Promise.all([
    Message.find(filter === "unread" ? { read: false } : {}).sort({ createdAt: -1 }).limit(200).lean(),
    Message.countDocuments({ read: false }),
  ]);

  return (
    <>
      <PageHeader title="Messages" description="Envoyés depuis le formulaire de contact du site.">
        <div role="group" aria-label="Filtre" className="flex rounded-[4px] border border-line-strong bg-surface p-0.5 text-sm">
          {[
            { key: "all", label: "Tous" },
            { key: "unread", label: `Non lus (${unread})` },
          ].map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/messages" : "/admin/messages?filter=unread"}
              aria-current={filter === f.key ? "true" : undefined}
              className={`rounded-[3px] px-3 py-1 ${filter === f.key ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </PageHeader>
      <MessagesList messages={serialize<MessageDTO[]>(messages)} />
    </>
  );
}

// Admin pages read the session and fresh data on every visit.
export const instant = false;
