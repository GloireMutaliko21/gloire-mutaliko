export const inputClass =
  "mt-1.5 block w-full rounded-[4px] border border-line-strong bg-surface px-3 py-2 text-[0.95rem] font-normal outline-none transition-colors focus:border-accent aria-[invalid=true]:border-danger";

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-[4px] bg-accent px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-[4px] border border-line-strong bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-ink disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-[4px] border border-danger/40 px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger hover:text-paper disabled:opacity-60",
  ghost: "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-sm text-muted transition-colors hover:bg-line/60 hover:text-ink",
};

export const cardClass = "rounded-[6px] border border-line bg-surface";
