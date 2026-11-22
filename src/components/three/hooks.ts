"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import type { SkillCategory } from "@/lib/types";
import { SKILL_CATEGORY_LIST } from "./colors";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** True while the element is on screen; used to pause WebGL render loops off-screen. */
export function useInView<T extends HTMLElement>(margin = "120px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

export type Palette = {
  ink: string;
  muted: string;
  accent: string;
  paper: string;
  cats: Record<SkillCategory, string>;
};

/**
 * Theme tokens resolved to hex for WebGL, which cannot read CSS variables.
 * Re-reads them whenever the theme changes. Only used in client-only scenes.
 */
export function usePalette(): Palette {
  const theme = useTheme();
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim() || "#888888";
    return {
      ink: v("--ink"),
      muted: v("--muted"),
      accent: v("--accent"),
      paper: v("--paper"),
      cats: Object.fromEntries(SKILL_CATEGORY_LIST.map((c) => [c, v(`--cat-${c}`)])) as Record<SkillCategory, string>,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
