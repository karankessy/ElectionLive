'use client';

import { useState } from 'react';
import { Party } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

type SortKey = 'total' | 'won' | 'lead';

interface Props {
  parties: Party[];
  baseline: Party[];
  changedIds?: Set<number>;
}

export default function PartyLeaderboard({ parties, baseline, changedIds }: Props) {
  const [sort, setSort] = useState<SortKey>('total');
  const sorted = [...parties].sort((a, b) => b[sort] - a[sort]);
  const maxTotal = Math.max(...parties.map(p => p.total), 1);

  function getDelta(id: number): number | null {
    const base = baseline.find(b => b.id === id);
    if (!base) return null;
    const curr = parties.find(p => p.id === id);
    const d = (curr?.total ?? 0) - base.total;
    return d !== 0 ? d : null;
  }

  function SortBtn({ col, label }: { col: SortKey; label: string }) {
    const isActive = sort === col;
    return (
      <button
        onClick={() => setSort(col)}
        className={`pill-btn focus-ring ${
          isActive ? 'pill-btn--active' : 'pill-btn--inactive'
        }`}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="section-title !mb-0">Party Standings</p>
        <div className="flex gap-1.5" role="group" aria-label="Sort parties by">
          <SortBtn col="total" label="Total" />
          <SortBtn col="won" label="Won" />
          <SortBtn col="lead" label="Leading" />
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-2 px-3 py-2 text-[10px] sm:text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide border-b border-[var(--border)] mb-1">
        <span className="w-5 text-right shrink-0">#</span>
        <span className="w-7 shrink-0" />
        <span className="flex-1">Party</span>
        <span className="w-10 text-right shrink-0">Won</span>
        <span className="w-10 text-right shrink-0">Lead</span>
        <span className="w-10 text-right shrink-0">Total</span>
        <span className="w-10 shrink-0" />
      </div>

      <div className="divide-y divide-[var(--border)]">
        {sorted.map((p, i) => {
          const color = partyColor(p.name);
          const delta = getDelta(p.id);
          const isHighlighted = changedIds?.has(p.id);

          return (
            <div
              key={p.id}
              className={`row-hover px-3 py-2.5 ${isHighlighted ? 'highlight-row' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] sm:text-xs text-[var(--muted)] w-5 text-right shrink-0 tabular-nums">
                  {i + 1}
                </span>

                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-7 h-7 rounded object-contain shrink-0" style={{ background: 'var(--img-bg)' }}
                  />
                ) : (
                  <span
                    className="w-7 h-7 rounded shrink-0"
                    style={{ background: color, opacity: 0.8 }}
                  />
                )}

                <span className="text-xs sm:text-sm flex-1 truncate font-medium text-[var(--text)]">
                  {p.name}
                </span>

                <span className="text-[11px] sm:text-xs text-[var(--muted)] w-10 text-right shrink-0 tabular-nums">
                  {fmt(p.won)}
                </span>
                <span className="text-[11px] sm:text-xs text-[var(--muted)] w-10 text-right shrink-0 tabular-nums">
                  {fmt(p.lead)}
                </span>
                <span className="text-sm font-bold w-10 text-right shrink-0 tabular-nums text-[var(--text)]">
                  {fmt(p.total)}
                </span>

                {delta !== null ? (
                  <span
                    className={`text-[11px] font-semibold w-10 text-right shrink-0 tabular-nums ${
                      delta > 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                ) : (
                  <span className="w-10 shrink-0" />
                )}
              </div>

              {/* Progress bar — hover responsive */}
              <div className="ml-12 flex gap-0.5 h-1.5 rounded overflow-hidden group cursor-pointer" style={{ background: 'var(--bar-track)' }}>
                <div
                  className="rounded-l transition-all duration-300 group-hover:h-2.5 group-hover:-mt-0.5"
                  style={{
                    flex: p.won,
                    background: color,
                    minWidth: p.won > 0 ? 3 : 0,
                    transition: 'flex 0.5s ease',
                  }}
                />
                <div
                  className="rounded-r transition-all duration-300 group-hover:h-2.5 group-hover:-mt-0.5"
                  style={{
                    flex: p.lead,
                    background: color,
                    opacity: 0.3,
                    minWidth: p.lead > 0 ? 3 : 0,
                    transition: 'flex 0.5s ease',
                  }}
                />
                {/* Remaining space */}
                <div style={{ flex: Math.max(0, maxTotal - p.total), transition: 'flex 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
        Solid = Won · Faded = Leading
      </p>
    </div>
  );
}
