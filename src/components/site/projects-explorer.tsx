"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { ProjectDTO } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { cn } from "./ui";

type Props = { projects: ProjectDTO[]; locale: Locale; dict: Dictionary["projects"] };

export function ProjectsExplorer({ projects, locale, dict }: Props) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const count = new Map<string, number>();
    projects.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [projects]);

  const visible = tag ? projects.filter((p) => p.tags.includes(tag)) : projects;

  return (
    <>
      {tags.length > 0 && (
        <div role="group" aria-label={dict.filter} className="flex flex-wrap gap-2">
          {[null, ...tags].map((t) => {
            const active = tag === t;
            return (
              <button
                key={t ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setTag(t)}
                className={cn(
                  "rounded-[3px] border px-3 py-1.5 text-sm transition-colors",
                  active ? "border-ink bg-ink text-paper" : "border-line-strong text-ink hover:border-ink",
                )}
              >
                {t ?? dict.all}
              </button>
            );
          })}
        </div>
      )}

      <motion.div layout className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <ProjectCard project={p} locale={locale} viewLabel={dict.view} priority={i < 3} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {visible.length === 0 && <p className="mt-12 text-muted">{dict.empty}</p>}
    </>
  );
}
