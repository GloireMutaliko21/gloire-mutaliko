import type { ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-[4px] bg-accent px-5 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-ink disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-[4px] border border-ink px-5 py-3 text-[0.95rem] font-medium text-ink transition-colors hover:bg-ink hover:text-white",
  quiet:
    "inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent",
};

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-5 md:px-10", className)}>{children}</div>;
}

/** Two-column section: a sticky heading rail on the left, content on the right. */
export function Section({
  id,
  title,
  children,
  aside,
}: {
  id: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-line">
      <Container className="grid gap-10 py-20 md:grid-cols-12 md:gap-8 md:py-28">
        <div className="md:col-span-3">
          <div className="md:sticky md:top-24">
            <h2 id={`${id}-title`} className="font-display text-[1.75rem] font-semibold leading-none tracking-tight">
              {title}
            </h2>
            {aside && <div className="mt-4 text-sm text-muted">{aside}</div>}
          </div>
        </div>
        <div className="md:col-span-9">{children}</div>
      </Container>
    </section>
  );
}

export function Tag({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[0.78rem] font-medium",
        active ? "border-accent bg-accent-wash text-accent" : "border-line-strong text-muted",
      )}
    >
      {children}
    </span>
  );
}
