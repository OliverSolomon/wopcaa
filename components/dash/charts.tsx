"use client";

import { useState } from "react";

/**
 * Single-series column chart: one hue (the accent), thin bars with rounded
 * data-ends on a recessive baseline, hover tooltip per bar, a table view for
 * screen readers. No legend: the card title names the series.
 */
export function WeeklyBars({ data }: { data: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const H = 160;
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];
  return (
    <figure>
      <div className="relative" style={{ height: H + 28 }} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <div key={t} className="hairline absolute inset-x-0 flex items-center border-t border-dashed" style={{ top: H - (t / max) * H }}>
            <span className="faint -mt-5 text-[10px] tabular-nums">{t}</span>
          </div>
        ))}
        <div className="absolute inset-x-6 top-0 flex items-end gap-[2px]" style={{ height: H }}>
          {data.map((d, i) => (
            <div key={d.label} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)}>
              <div
                className="w-full max-w-[22px] rounded-t-[4px] transition-opacity"
                style={{ height: `${Math.max(d.value ? 3 : 0, (d.value / max) * 100)}%`, background: "var(--d-accent)", opacity: hover === null || hover === i ? 1 : 0.4 }}
              />
              {hover === i ? (
                <div className="panel pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap px-3 py-2 text-xs !shadow-lg">
                  <p className="faint">Week of {d.label}</p>
                  <p className="mt-0.5 font-semibold tabular-nums">{d.value} report{d.value === 1 ? "" : "s"}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-6 bottom-0 flex gap-[2px]">
          {data.map((d, i) => (
            <span key={d.label} className="faint flex-1 text-center text-[10px]">{i % 2 === data.length % 2 ? d.label : ""}</span>
          ))}
        </div>
      </div>
      <table className="sr-only"><caption>Reports per week</caption><tbody>{data.map((d) => <tr key={d.label}><th>{d.label}</th><td>{d.value}</td></tr>)}</tbody></table>
    </figure>
  );
}

/** Horizontal bars for a ranked breakdown, value labelled at the end of each bar. */
export function RankBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  return (
    <ul className="grid gap-3">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${d.value} (${Math.round((d.value / total) * 100)}%)`}>
          <div className="mb-1 flex justify-between gap-3 text-[13px]">
            <span className="truncate">{d.label}</span>
            <span className="muted tabular-nums">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--d-hover)]">
            <div className="h-full rounded-full bg-[var(--d-accent)] transition-[filter] group-hover:brightness-110" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
