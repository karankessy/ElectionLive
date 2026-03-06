'use client';

import { useState } from 'react';
import { Party } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

type SortKey = 'total' | 'won' | 'lead';

interface Props {
  parties: Party[];
  baseline: Party[];
}

export default function PartyLeaderboard({ parties, baseline }: Props) {
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
    return (
      <button
        onClick={() => setSort(col)}
        className={`px-2 py-0.5 rounded text-xs transition-colors ${
          sort === col
            ? 'bg-[var(--accent)] text-black font-bold'
            : 'text-[var(--muted)] hover:text-white'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="section-title mb-0">Party Standings</p>
        <div className="flex gap-1">
          <SortBtn col="total" label="Total" />
          <SortBtn col="won" label="Won" />
          <SortBtn col="lead" label="Leading" />
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((p, i) => {
          const color = partyColor(p.name);
          const delta = getDelta(p.id);

          return (
            <div key={p.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[var(--muted)] w-4 text-right shrink-0">{i + 1}</span>

                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-5 h-5 rounded object-contain bg-white/5 shrink-0"
                  />
                ) : (
                  <span
                    className="w-5 h-5 rounded shrink-0"
                    style={{ background: color, opacity: 0.7 }}
                  />
                )}

                <span className="text-sm flex-1 truncate">{p.name}</span>

                <span className="text-xs text-[var(--muted)] shrink-0">
                  W <span className="text-white font-semibold">{fmt(p.won)}</span>
                </span>
                <span className="text-xs text-[var(--muted)] shrink-0">
                  L <span className="text-white font-semibold">{fmt(p.lead)}</span>
                </span>
                <span className="text-sm font-bold w-8 text-right shrink-0">{fmt(p.total)}</span>

                {delta !== null && (
                  <span
                    className={`text-xs font-semibold w-8 text-right shrink-0 ${
                      delta > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                )}
              </div>

              {/* Stacked bar: won (solid) + leading (translucent) */}
              <div className="ml-9 flex gap-0.5 h-1.5 rounded overflow-hidden">
                <div
                  className="rounded-l"
                  style={{
                    width: `${(p.won / maxTotal) * 90}%`,
                    background: color,
                    minWidth: p.won > 0 ? 3 : 0,
                  }}
                />
                <div
                  style={{
                    width: `${(p.lead / maxTotal) * 90}%`,
                    background: color,
                    opacity: 0.4,
                    minWidth: p.lead > 0 ? 3 : 0,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-[var(--muted)]">
        Solid = Won · Faded = Leading
      </p>
    </div>
  );
}
