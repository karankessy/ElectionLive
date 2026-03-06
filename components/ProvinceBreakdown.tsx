'use client';

import { useState } from 'react';
import { Province } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  provinces: Province[];
}

export default function ProvinceBreakdown({ provinces }: Props) {
  const [selected, setSelected] = useState<number | 'all'>('all');

  const shown = selected === 'all' ? provinces : provinces.filter(p => p.id === selected);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="section-title mb-0">Province Breakdown</p>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelected('all')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              selected === 'all'
                ? 'bg-[var(--accent)] text-black font-bold'
                : 'bg-[var(--surface2)] text-[var(--muted)] hover:text-white'
            }`}
          >
            All
          </button>
          {provinces.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`px-2 py-0.5 rounded text-xs truncate transition-colors ${
                selected === p.id
                  ? 'bg-[var(--accent)] text-black font-bold'
                  : 'bg-[var(--surface2)] text-[var(--muted)] hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {shown.map(prov => {
          const active = prov.parties.filter(p => p.won + p.lead > 0);
          const totalFilled = active.reduce((s, p) => s + p.won + p.lead, 0);

          return (
            <div
              key={prov.id}
              className="bg-[var(--surface2)] rounded-lg p-3 border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{prov.name}</p>
                <span className="text-xs text-[var(--muted)]">{prov.seats} seats</span>
              </div>

              {/* Mini bar */}
              {totalFilled > 0 && (
                <div className="flex gap-0.5 rounded overflow-hidden h-2 mb-2 bg-[var(--border)]">
                  {active.slice(0, 6).map(p => (
                    <div
                      key={p.name}
                      title={`${p.name}: ${p.won + p.lead}`}
                      style={{
                        width: `${((p.won + p.lead) / Math.max(totalFilled, 1)) * 100}%`,
                        background: partyColor(p.name),
                        minWidth: 3,
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                {active.slice(0, 5).map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs">
                    {p.img && (
                      <img
                        src={p.img}
                        alt=""
                        className="w-3.5 h-3.5 rounded object-contain shrink-0"
                      />
                    )}
                    <span className="flex-1 truncate text-[var(--muted)]">{p.name}</span>
                    <span className="font-semibold">{fmt(p.won + p.lead)}</span>
                  </div>
                ))}
                {active.length === 0 && (
                  <p className="text-xs text-[var(--muted)]">Counting in progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
