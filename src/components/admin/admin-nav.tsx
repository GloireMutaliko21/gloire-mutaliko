"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Briefcase, FolderKanban, History, Inbox, Sparkles, UserRound } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: BarChart3, exact: true },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/profile", label: "Profil", icon: UserRound },
  { href: "/admin/skills", label: "Compétences", icon: Sparkles },
  { href: "/admin/experience", label: "Expériences", icon: Briefcase },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban },
  { href: "/admin/history", label: "Historique", icon: History },
];

export function AdminNav({ unreadBadge }: { unreadBadge: ReactNode }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="-mx-1 overflow-x-auto md:mx-0 md:overflow-visible">
      <ul className="flex gap-1 md:flex-col">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-[4px] px-2.5 py-2 text-sm transition-colors ${
                  active ? "bg-accent-wash font-medium text-accent" : "text-ink hover:bg-paper"
                }`}
              >
                <Icon size={16} aria-hidden />
                {label}
                {href === "/admin/messages" && unreadBadge}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
