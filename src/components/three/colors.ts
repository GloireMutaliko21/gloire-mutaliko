import type { SkillCategory } from "@/lib/types";

export const SKILL_CATEGORY_LIST: SkillCategory[] = ["frontend", "backend", "devops", "data", "tools"];

/** CSS color for a skill category; follows the light or dark theme. */
export function categoryColor(category: SkillCategory) {
  return `var(--cat-${category})`;
}
