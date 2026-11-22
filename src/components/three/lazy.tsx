"use client";

import dynamic from "next/dynamic";

/** WebGL scenes load in the browser only, after the text content has painted. */
export const SkillGraph = dynamic(() => import("./skill-graph"), { ssr: false });
export const OrbitRings = dynamic(() => import("./orbit-rings"), { ssr: false });
export const FloatingShape = dynamic(() => import("./floating-shape"), { ssr: false });
