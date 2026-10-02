"use client";

import { useEffect, useRef, useState } from "react";

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
