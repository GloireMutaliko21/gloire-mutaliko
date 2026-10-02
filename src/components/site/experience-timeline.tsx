"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/dictionaries";
import { formatMonth, tr, type Locale } from "@/lib/i18n";
import type { ExperienceDTO } from "@/lib/types";
import { Tag } from "./ui";

type Props = { items: ExperienceDTO[]; locale: Locale; dict: Dictionary["experience"] };

/** Vertical timeline whose rule fills as the reader scrolls through it. */
export function ExperienceTimeline({ items, locale, dict }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={list} className="relative">
      <span className="absolute bottom-2 left-[5px] top-2 w-px bg-line" aria-hidden />
      <motion.span
        className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-accent"
        style={{ scaleY: progress }}
        aria-hidden
      />
      {items.map((job) => {
        const highlights = job.highlights.map((h) => tr(h, locale)).filter(Boolean);
        return (
          <li key={job._id} className="relative grid gap-3 pb-14 pl-10 last:pb-0 md:grid-cols-9 md:gap-8">
            <span
              className={`absolute left-0 top-[0.4rem] size-[11px] rounded-full border-2 bg-paper ${
                job.end ? "border-line-strong" : "border-accent"
              }`}
              aria-hidden
            />
            <p className="text-sm tabular-nums text-muted md:col-span-2 md:pt-1">
              <time dateTime={job.start}>{formatMonth(job.start, locale)}</time>
              {" – "}
              {job.end ? <time dateTime={job.end}>{formatMonth(job.end, locale)}</time> : dict.present}
            </p>
            <div className="md:col-span-7">
              <h3 className="font-display text-[1.35rem] font-semibold leading-snug tracking-tight">
                {tr(job.role, locale)}
                <span className="font-normal text-muted">
                  {" · "}
                  {job.companyUrl ? (
                    <a href={job.companyUrl} target="_blank" rel="noreferrer" className="text-ink underline decoration-line-strong underline-offset-4 hover:text-accent">
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </span>
              </h3>
              {tr(job.location, locale) && <p className="mt-1 text-sm text-muted">{tr(job.location, locale)}</p>}
              {tr(job.summary, locale) && (
                <p className="mt-4 max-w-[40rem] leading-relaxed">{tr(job.summary, locale)}</p>
              )}
              {highlights.length > 0 && (
                <ul className="mt-4 max-w-[40rem] space-y-2 text-muted">
                  {highlights.map((h, i) => (
                    <li key={i} className="relative pl-5 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-line-strong">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {job.stack.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={dict.stack}>
                  {job.stack.map((s) => (
                    <li key={s}>
                      <Tag>{s}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
