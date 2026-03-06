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
        <p className="section-title !mb-0">Province Breakdown</p>
      </div>

      {/* Province filter pills */}
      <div className="pills-scroll mb-4" role="group" aria-label="Filter by province">
        <button
          onClick={() => setSelected('all')}
          className={`pill-btn focus-ring shrink-0 ${
            selected === 'all' ? 'pill-btn--active' : 'pill-btn--inactive'
          }`}
          aria-pressed={selected === 'all'}
        >
          All
        </button>
        {provinces.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`pill-btn focus-ring shrink-0 truncate max-w-[140px] ${
              selected === p.id ? 'pill-btn--active' : 'pill-btn--inactive'
            }`}
            aria-pressed={selected === p.id}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {shown.map(prov => {
          const active = prov.parties.filter(p => p.won + p.lead > 0);
          const totalFilled = active.reduce((s, p) => s + p.won + p.lead, 0);

          return (
            <div key={prov.id} className="inner-card hover-lift">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">{prov.name}</p>
                <span className="text-[10px] sm:text-[11px] text-[var(--muted)] tabular-nums font-medium">
                  {prov.seats} seats
                </span>
              </div>

              {/* Mini bar */}
              {totalFilled > 0 && (
                <div className="flex gap-0.5 rounded overflow-hidden h-2 mb-3" style={{ background: 'var(--bar-track)' }}>
                  {active.slice(0, 6).map(p => (
                    <div
                      key={p.name}
                      title={`${p.name}: ${p.won + p.lead}`}
                      className="bar-segment"
                      style={{
                        flex: p.won + p.lead,
                        minWidth: 3,
                        background: partyColor(p.name),
                        transition: 'flex 0.5s ease',
                      }}
                    />
                  ))}
                  {/* Remaining seats */}
                  {prov.seats - totalFilled > 0 && (
                    <div style={{ flex: prov.seats - totalFilled, transition: 'flex 0.5s ease' }} />
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                {active.slice(0, 5).map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                    {p.img && (
                      <img
                        src={p.img}
                        alt=""
                        className="w-5 h-5 rounded object-contain shrink-0"
                      />
                    )}
                    <span className="flex-1 truncate text-[var(--text-secondary)]">{p.name}</span>
                    <span className="font-semibold tabular-nums text-[var(--text)]">
                      {fmt(p.won + p.lead)}
                    </span>
                  </div>
                ))}
                {active.length === 0 && (
                  <p className="text-[11px] text-[var(--muted)]">Counting in progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
