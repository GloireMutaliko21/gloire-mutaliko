"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { tr, type Locale } from "@/lib/i18n";
import type { Asset } from "@/lib/types";
import { cn } from "./ui";

type Props = { images: Asset[]; title: string; locale: Locale; dict: Dictionary["projects"] };

/** Gallery that turns images like the faces of a cube, with a full-screen viewer. */
export function Gallery({ images, title, locale, dict }: Props) {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [viewer, setViewer] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (next: number) => {
      setState(([current]) => [(next + images.length) % images.length, next > current ? 1 : -1]);
    },
    [images.length],
  );

  useEffect(() => {
    if (!viewer) return;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewer(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [viewer, index, go]);

  if (images.length === 0) return null;
  const current = images[index];
  const alt = (img: Asset, i: number) => tr(img.alt, locale) || `${title}, ${dict.image} ${i + 1}`;

  return (
    <section aria-label={dict.gallery}>
      <div className="relative [perspective:1600px]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-line bg-surface">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              className="absolute inset-0 [backface-visibility:hidden]"
              variants={{
                enter: (d: number) => ({ rotateY: d * 70, x: `${d * 40}%`, opacity: 0, scale: 0.9 }),
                center: { rotateY: 0, x: "0%", opacity: 1, scale: 1 },
                exit: (d: number) => ({ rotateY: d * -70, x: `${d * -40}%`, opacity: 0, scale: 0.9 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              drag={images.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(index + 1);
                else if (info.offset.x > 80) go(index - 1);
              }}
            >
              <Image src={current.url} alt={alt(current, index)} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" priority={index === 0} draggable={false} />
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setViewer(true)}
            aria-label={dict.enlarge}
            className="absolute right-3 top-3 z-10 rounded-[4px] bg-paper/90 p-2 text-ink backdrop-blur hover:bg-ink hover:text-paper"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm tabular-nums text-muted" aria-live="polite">
              {dict.image} {index + 1} {dict.of} {images.length}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(index - 1)} aria-label={dict.previous} className="rounded-[4px] border border-line-strong p-2 hover:border-ink">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label={dict.next} className="rounded-[4px] border border-line-strong p-2 hover:border-ink">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`${dict.image} ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-[3px] border-2 transition-opacity",
                  i === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {viewer && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={dict.gallery}
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/95 p-4 md:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewer(false)}
          >
            <motion.div
              className="relative h-full w-full"
              initial={{ scale: 0.92, rotateX: 8 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={current.url} alt={alt(current, index)} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button ref={closeButton} type="button" onClick={() => setViewer(false)} aria-label={dict.closeViewer} className="absolute right-4 top-4 rounded-[4px] p-2 text-white hover:bg-white/10">
              <X size={22} />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); go(index - 1); }} aria-label={dict.previous} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-[4px] p-2 text-white hover:bg-white/10">
                  <ChevronLeft size={28} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); go(index + 1); }} aria-label={dict.next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[4px] p-2 text-white hover:bg-white/10">
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
