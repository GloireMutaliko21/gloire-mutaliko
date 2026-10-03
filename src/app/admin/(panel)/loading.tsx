export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Chargement…</span>
      <div className="h-8 w-56 rounded-[4px] bg-line/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-[6px] bg-line/50" />
        ))}
      </div>
      <div className="h-64 rounded-[6px] bg-line/40" />
    </div>
  );
}
