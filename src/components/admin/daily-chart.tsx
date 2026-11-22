"use client";

import { useState } from "react";

type Point = { date: string; views: number; visitors: number };

const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

/** Single-series column chart of daily views, with a per-column tooltip. */
export function DailyChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.views));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <figure>
      <div className="relative flex h-56 gap-3">
        {/* y axis */}
        <div className="relative w-8 shrink-0 text-right text-[11px] tabular-nums text-muted">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / top) * 100}%`, transform: "translateY(50%)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <span key={t} className="absolute inset-x-0 h-px bg-line" style={{ bottom: `${(t / top) * 100}%` }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                className="group relative flex h-full flex-1 cursor-default items-end focus-visible:outline-none"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${fmtDay.format(new Date(d.date))} : ${d.views} vues, ${d.visitors} visiteurs`}
              >
                <span
                  className={`block w-full rounded-t-[4px] transition-colors ${active === i ? "bg-ink" : "bg-accent"}`}
                  style={{ height: d.views ? `max(2px, ${(d.views / top) * 100}%)` : 0 }}
                />
              </button>
            ))}
          </div>
          {active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[4px] border border-line bg-surface px-2.5 py-1.5 text-xs"
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
            >
              <span className="block text-muted">{fmtDay.format(new Date(data[active].date))}</span>
              <span className="block font-medium tabular-nums">{data[active].views} vues</span>
              <span className="block tabular-nums text-muted">{data[active].visitors} visiteurs</span>
            </div>
          )}
        </div>
      </div>
      <div className="ml-11 mt-2 flex text-[11px] text-muted">
        {data.map((d, i) => (
          <span key={d.date} className="flex-1 whitespace-nowrap text-center">
            {i % labelEvery === 0 ? fmtDay.format(new Date(d.date)) : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Vues par jour</caption>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Vues</th>
            <th>Visiteurs</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.views}</td>
              <td>{d.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function niceStep(max: number) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  return Math.max(1, (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow);
}
