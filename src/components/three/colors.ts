import type { SkillCategory } from "@/lib/types";

/** Mirrors the --cat-* tokens in globals.css (WebGL cannot read CSS variables). */
export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  frontend: "#3d3bf3",
  backend: "#0e9f8e",
  devops: "#d98e04",
  data: "#d6409f",
  tools: "#7a8199",
};
