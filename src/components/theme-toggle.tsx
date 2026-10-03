"use client";

import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { setTheme, useTheme } from "@/lib/theme";

type Props = { toDark: string; toLight: string; className?: string; showLabel?: boolean };

export function ThemeToggle({ toDark, toLight, className = "", showLabel }: Props) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? toLight : toDark;

  return (
    <button
      type="button"
      onClick={(e) => setTheme(isDark ? "light" : "dark", { x: e.clientX, y: e.clientY })}
      aria-label={showLabel ? undefined : label}
      title={label}
      className={`inline-flex items-center gap-2 rounded-[4px] ${className}`}
    >
      <span className="relative inline-grid size-[18px] place-items-center overflow-hidden" aria-hidden>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={theme}
            initial={{ y: 14, rotate: -90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -14, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="inline-grid place-items-center"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {showLabel && <span>{label}</span>}
    </button>
  );
}
