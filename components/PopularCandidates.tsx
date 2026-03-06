'use client';

import { PopularRace } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

const CLOSE_THRESHOLD = 1500;

interface Props {
  races: PopularRace[];
}

export default function PopularCandidates({ races }: Props) {
  // Sort: close races first (by smallest margin), then the rest
  const enriched = races.map(race => {
    const sorted = [...race.candidates].filter(c => c.votes > 0).sort((a, b) => b.votes - a.votes);
    const top = sorted[0];
    const second = sorted[1];
    const margin = top && second ? top.votes - second.votes : Infinity;
    const isClose = margin > 0 && margin < CLOSE_THRESHOLD;
    return { race, sorted, top, second, margin, isClose };
  });

  const ordered = [
    ...enriched.filter(r => r.isClose).sort((a, b) => a.margin - b.margin),
    ...enriched.filter(r => !r.isClose),
  ];

  const closeCount = enriched.filter(r => r.isClose).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="section-title !mb-0">Featured Constituency Battles</p>
        {closeCount > 0 && (
          <span className="badge" style={{ background: 'var(--amber-bg)', color: 'var(--amber-text)', borderColor: 'var(--amber-border)' }}>
            {closeCount} Close Race{closeCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
        {ordered.map(({ race, sorted, top, second, margin, isClose }) => {

          return (
            <div
              key={race.constituency}
              className={`inner-card hover-lift !py-3 !px-3`}
              style={isClose ? { borderColor: 'var(--amber-border)', background: 'color-mix(in srgb, var(--amber-bg) 40%, var(--surface))' } : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-[11px] font-semibold truncate" style={{ color: isClose ? 'var(--amber-text)' : 'var(--muted)' }}>
                  {race.constituency}
                </p>
                {isClose && (
                  <span className="badge text-[8px] !px-1.5 !py-0.5" style={{ background: 'var(--amber-bg)', color: 'var(--amber-text)', borderColor: 'var(--amber-border)' }}>
                    Close · {fmt(margin)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {sorted.slice(0, 2).map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-2">
                    {c.img ? (
                      <img
                        src={c.img}
                        alt={c.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 shrink-0" style={{ '--tw-ring-color': 'var(--border)' } as React.CSSProperties}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: partyColor(c.party) }}
                      >
                        {c.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[11px] sm:text-xs font-medium truncate ${
                          idx === 0 ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {c.name}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-[var(--muted)] truncate">{c.party}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-[11px] sm:text-xs font-bold tabular-nums ${
                          idx === 0 ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {fmt(c.votes)}
                      </p>
                      {idx === 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0 ml-auto mt-0.5"
                          style={{ background: partyColor(c.party) }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {top && second && (
                <div className="mt-2 pt-1.5 border-t border-[var(--border)] text-[9px] sm:text-[10px] text-[var(--muted)]">
                  Margin:{' '}
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: isClose ? 'var(--amber-text)' : 'var(--green)' }}
                  >
                    {fmt(margin)} votes
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
