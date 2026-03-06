'use client';

import { PopularRace } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  races: PopularRace[];
}

export default function PopularCandidates({ races }: Props) {
  return (
    <div className="card">
      <p className="section-title">Featured Constituency Battles</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {races.map(race => {
          const sorted = [...race.candidates].sort((a, b) => b.votes - a.votes);
          const top = sorted[0];
          const second = sorted[1];
          const margin = top && second ? top.votes - second.votes : 0;
          const isClose = margin > 0 && margin < 1500;

          return (
            <div
              key={race.constituency}
              className={`bg-[var(--surface2)] rounded-lg p-3 border ${
                isClose ? 'border-amber-500/40' : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[var(--muted)]">{race.constituency}</p>
                {isClose && (
                  <span className="badge bg-amber-500/20 text-amber-400">Close</span>
                )}
              </div>

              <div className="space-y-2">
                {sorted.slice(0, 4).map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-3 shrink-0">{idx + 1}</span>

                    {c.img ? (
                      <img
                        src={c.img}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                        style={{ background: partyColor(c.party), opacity: 0.8 }}
                      >
                        {c.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          idx === 0 ? 'text-white' : 'text-[var(--muted)]'
                        }`}
                      >
                        {c.name}
                      </p>
                      <p className="text-[10px] text-[var(--muted)] truncate">{c.party}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-bold ${
                          idx === 0 ? 'text-white' : 'text-[var(--muted)]'
                        }`}
                      >
                        {fmt(c.votes)}
                      </p>
                    </div>

                    {idx === 0 && (
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: partyColor(c.party) }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {top && second && (
                <div className="mt-2 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--muted)]">
                  Margin:{' '}
                  <span
                    className={`font-semibold ${
                      isClose ? 'text-amber-400' : 'text-emerald-400'
                    }`}
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
