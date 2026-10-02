"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { tr, type Locale } from "@/lib/i18n";
import type { ProjectDTO } from "@/lib/types";
import { Tag } from "./ui";

type Props = { project: ProjectDTO; locale: Locale; viewLabel: string; priority?: boolean };

/** Project card whose cover tilts in 3D toward the pointer. */
export function ProjectCard({ project, locale, viewLabel, priority }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 220, damping: 20 });
  const glare = useTransform(
    x,
    [-0.5, 0.5],
    [
      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,.28) 0%, transparent 70%)",
      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,.28) 100%, transparent 70%)",
    ],
  );

  const title = tr(project.title, locale);
  const cover = project.images[0];
  const href = `/${locale}/projects/${project.slug}`;

  return (
    <article className="group">
      <Link href={href} aria-label={`${viewLabel}: ${title}`} className="block [perspective:1100px]">
        <motion.div
          className="relative aspect-[4/3] overflow-hidden rounded-[6px] border border-line bg-accent-wash [transform-style:preserve-3d]"
          style={{ rotateX, rotateY }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const rect = e.currentTarget.getBoundingClientRect();
            x.set((e.clientX - rect.left) / rect.width - 0.5);
            y.set((e.clientY - rect.top) / rect.height - 0.5);
          }}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
        >
          {cover ? (
            <Image
              src={cover.url}
              alt={tr(cover.alt, locale) || title}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <CoverPlaceholder title={title} tags={project.tags} />
          )}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
        </motion.div>
      </Link>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[1.45rem] font-semibold leading-tight tracking-tight">
          <Link href={href} className="hover:text-accent">
            {title}
          </Link>
        </h3>
        <span className="shrink-0 text-sm tabular-nums text-muted">{project.year}</span>
      </div>
      <p className="mt-2 max-w-[34rem] leading-relaxed text-muted">{tr(project.summary, locale)}</p>
      {project.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 5).map((t) => (
            <li key={t}>
              <Tag>{t}</Tag>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/** Typographic cover used until screenshots are uploaded. */
function CoverPlaceholder({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 [transform:translateZ(40px)]">
      <span className="text-sm text-accent">{tags.slice(0, 3).join(" / ")}</span>
      <span className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-bold leading-[0.95] tracking-[-0.04em] text-accent">
        {title}
      </span>
    </div>
  );
}
