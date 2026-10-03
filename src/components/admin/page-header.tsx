import type { ReactNode } from "react";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-[40rem] text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
