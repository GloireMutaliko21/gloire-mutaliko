import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "../actions";

export const instant = false;

async function UnreadBadge() {
  await connection();
  const { count: unread } = await db().from("messages").select("id", { count: "exact", head: true }).eq("read", false);
  if (!unread) return null;
  return (
    <span className="ml-auto rounded-[3px] bg-accent px-1.5 text-xs font-medium tabular-nums leading-5 text-paper">
      {unread}
      <span className="sr-only"> non lus</span>
    </span>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-surface md:sticky md:top-0 md:h-dvh md:border-b-0 md:border-r">
        <div className="flex h-full flex-col gap-6 p-4 md:p-5">
          <a href="/" target="_blank" className="font-display text-lg font-semibold tracking-tight hover:text-accent">
            Portfolio
            <span className="block text-xs font-normal text-muted">Voir le site public</span>
          </a>
          <AdminNav
            unreadBadge={
              <Suspense>
                <UnreadBadge />
              </Suspense>
            }
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:mt-auto md:flex-col md:items-start">
          <ThemeToggle toDark="Thème sombre" toLight="Thème clair" showLabel className="text-sm text-muted hover:text-ink" />
          <form action={logout}>
            <button type="submit" className="text-sm text-muted hover:text-ink">
              Se déconnecter
            </button>
          </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <main className="mx-auto max-w-[1100px] px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}
