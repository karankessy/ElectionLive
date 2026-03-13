'use client';

import { useEffect, useState } from 'react';
import { Province } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  provinces: Province[];
}

export default function ProvinceBreakdown({ provinces }: Props) {
  const [selected, setSelected] = useState<number | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

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
        {shown.map((prov, provIdx) => {
          const active = prov.parties.filter(p => p.won + p.lead > 0);
          const totalFilled = active.reduce((s, p) => s + p.won + p.lead, 0);
          const filledPct = prov.seats > 0 ? Math.round((totalFilled / prov.seats) * 100) : 0;

          return (
            <div key={prov.id} className="inner-card hover-lift">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">{prov.name}</p>
                <span className="text-[10px] sm:text-xs text-[var(--muted)] tabular-nums font-medium">
                  {totalFilled}/{prov.seats}
                </span>
              </div>

              {/* Segmented bar */}
              <div className="relative group mb-3">
                <div className="flex gap-px rounded-md overflow-hidden h-2 sm:h-2.5" style={{ background: 'var(--bar-track)' }}>
                  {active.slice(0, 6).map((p, i) => {
                    const segPct = mounted ? ((p.won + p.lead) / prov.seats) * 100 : 0;
                    return (
                      <div
                        key={p.name}
                        className="bar-segment relative group/seg"
                        style={{
                          width: `${segPct}%`,
                          minWidth: p.won + p.lead > 0 ? 3 : 0,
                          background: partyColor(p.name),
                          transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transitionDelay: `${provIdx * 40 + i * 30}ms`,
                        }}
                      >
                        {/* Segment tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[var(--text)] text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover/seg:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                          {p.name}: {p.won + p.lead}
                        </div>
                      </div>
                    );
                  })}
                  {/* Remaining seats (unfilled) */}
                  {prov.seats - totalFilled > 0 && (
                    <div style={{ width: `${((prov.seats - totalFilled) / prov.seats) * 100}%`, transition: 'width 0.5s ease' }} />
                  )}
                </div>
                {/* Progress text overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[10px] font-bold text-white drop-shadow-sm tabular-nums">
                    {filledPct}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {active.slice(0, 5).map(p => {
                  const pPct = prov.seats > 0 ? ((p.won + p.lead) / prov.seats) * 100 : 0;
                  return (
                    <div key={p.name} className="group/row">
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                        {p.img ? (
                          <img
                            src={p.img}
                            alt=""
                            className="w-5 h-5 rounded object-contain shrink-0"
                          />
                        ) : (
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ background: partyColor(p.name) }}
                          />
                        )}
                        <span className="flex-1 truncate text-[var(--text-secondary)]">{p.name}</span>
                        <span className="font-semibold tabular-nums text-[var(--text)]">
                          {fmt(p.won + p.lead)}
                        </span>
                      </div>
                      {/* Mini individual bar */}
                      <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: mounted ? `${pPct}%` : '0%',
                            background: partyColor(p.name),
                            opacity: 0.6,
                            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transitionDelay: `${provIdx * 40 + 100}ms`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
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
