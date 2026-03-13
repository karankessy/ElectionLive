'use client';

import { useEffect, useState } from 'react';
import { Party } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

const TOTAL_SEATS = 165;
type SortKey = 'total' | 'won' | 'lead';

function SortBtn({ col, label, sort, setSort }: { col: SortKey; label: string; sort: SortKey; setSort: (s: SortKey) => void }) {
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

interface Props {
  parties: Party[];
  baseline: Party[];
  changedIds?: Set<number>;
}

export default function PartyLeaderboard({ parties, baseline, changedIds }: Props) {
  const [sort, setSort] = useState<SortKey>('total');
  const [mounted, setMounted] = useState(false);
  const sorted = [...parties].sort((a, b) => b[sort] - a[sort]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  function getDelta(id: number): number | null {
    const base = baseline.find(b => b.id === id);
    if (!base) return null;
    const curr = parties.find(p => p.id === id);
    const d = (curr?.total ?? 0) - base.total;
    return d !== 0 ? d : null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="section-title !mb-0">Final Party Standings</p>
        <div className="flex gap-2" role="group" aria-label="Sort parties by">
          <SortBtn col="total" label="Total" sort={sort} setSort={setSort} />
          <SortBtn col="won" label="Won" sort={sort} setSort={setSort} />
          <SortBtn col="lead" label="Leading" sort={sort} setSort={setSort} />
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-2 px-2.5 py-2 text-[10px] sm:text-xs font-semibold text-[var(--muted)] uppercase tracking-wide border-b border-[var(--border)] mb-1">
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
          const wonPct = mounted ? (p.won / TOTAL_SEATS) * 100 : 0;
          const leadPct = mounted ? (p.lead / TOTAL_SEATS) * 100 : 0;
          const totalPct = wonPct + leadPct;

          return (
            <div
              key={p.id}
              className={`row-hover px-2.5 py-2.5 ${isHighlighted ? 'highlight-row' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs sm:text-sm text-[var(--muted)] w-5 text-right shrink-0 tabular-nums">
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

                <span className="text-xs sm:text-sm flex-1 truncate font-semibold text-[var(--text)]">
                  {p.name}
                </span>

                <span className="text-xs sm:text-sm text-[var(--muted)] w-10 text-right shrink-0 tabular-nums">
                  {fmt(p.won)}
                </span>
                <span className="text-xs sm:text-sm text-[var(--muted)] w-10 text-right shrink-0 tabular-nums">
                  {fmt(p.lead)}
                </span>
                <span className="text-sm sm:text-base font-bold w-10 text-right shrink-0 tabular-nums text-[var(--text)]">
                  {fmt(p.total)}
                </span>

                {delta !== null ? (
                  <span
                    className={`text-xs font-semibold w-10 text-right shrink-0 tabular-nums ${
                      delta > 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                ) : (
                  <span className="w-10 shrink-0" />
                )}
              </div>

              {/* Progress bar */}
              <div className="ml-12 relative group cursor-pointer">
                <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                  <div
                    className="rounded-l-full transition-all duration-500 group-hover:brightness-110"
                    style={{
                      width: `${wonPct}%`,
                      background: color,
                      transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: `${i * 30}ms`,
                    }}
                  />
                  <div
                    className="transition-all duration-500 group-hover:brightness-110"
                    style={{
                      width: `${leadPct}%`,
                      background: color,
                      opacity: 0.3,
                      borderRadius: wonPct === 0 ? '9999px 0 0 9999px' : undefined,
                      transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: `${i * 30 + 50}ms`,
                    }}
                  />
                </div>
                {/* Hover tooltip */}
                {p.total > 0 && (
                  <div className="absolute -top-7 right-0 px-2 py-1 bg-[var(--text)] text-white text-[9px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg tabular-nums">
                    {p.won}W + {p.lead}L = {p.total} ({((p.total / TOTAL_SEATS) * 100).toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between">
        <p className="text-xs text-[var(--muted)]">
          <span className="inline-block w-2.5 h-1.5 rounded-sm mr-1" style={{ background: 'var(--accent)' }} /> Won
          <span className="inline-block w-2.5 h-1.5 rounded-sm mr-1 ml-3 opacity-30" style={{ background: 'var(--accent)' }} /> Leading
        </p>
        <p className="text-[10px] sm:text-xs tabular-nums text-[var(--muted)]">{TOTAL_SEATS} total seats</p>
      </div>
    </div>
  );
}
