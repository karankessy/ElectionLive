'use client';

import { PopularRace } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

const CLOSE_THRESHOLD = 1500;

interface Props {
  races: PopularRace[];
}

export default function CloseRaces({ races }: Props) {
  const close = races
    .flatMap(r => {
      const sorted = [...r.candidates].sort((a, b) => b.votes - a.votes);
      const top = sorted[0];
      const second = sorted[1];
      if (!top || !second || top.votes === 0) return [];
      const margin = top.votes - second.votes;
      if (margin >= CLOSE_THRESHOLD || margin < 0) return [];
      return [{ ...r, margin, top, second }];
    })
    .sort((a, b) => a.margin - b.margin);

  return (
    <div className="card card--highlight">
      <div className="flex items-center gap-2 mb-4">
        <p className="section-title !mb-0" style={{ color: 'var(--amber)' }}>
          Close Races
        </p>
        <span className="text-[11px] text-[var(--muted)]">
          Margin under {fmt(CLOSE_THRESHOLD)}
        </span>
        {close.length > 0 && (
          <span className="badge bg-amber-100 text-amber-800 border-amber-300 ml-auto">
            {close.length}
          </span>
        )}
      </div>

      {close.length === 0 ? (
        <p className="text-[var(--muted)] text-xs sm:text-sm py-4 text-center">
          No races within {fmt(CLOSE_THRESHOLD)} votes
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {close.map(r => (
            <div
              key={r.constituency}
              className="inner-card hover-lift border-amber-200 bg-amber-50/50"
            >
              <p className="text-[11px] sm:text-xs font-semibold text-amber-800 mb-2.5 truncate">
                {r.constituency}
              </p>

              <div className="flex items-center gap-2.5 mb-2">
                {r.top.img ? (
                  <img src={r.top.img} alt={r.top.name} className="w-8 h-8 rounded-full object-cover ring-2 shrink-0" style={{ borderColor: partyColor(r.top.party) }} />
                ) : (
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: partyColor(r.top.party) }}>
                    {r.top.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate text-[var(--text)]">{r.top.name}</p>
                  <p className="text-[10px] text-[var(--muted)] truncate">{r.top.party}</p>
                </div>
                <span className="text-xs sm:text-sm font-bold tabular-nums text-[var(--text)] shrink-0">{fmt(r.top.votes)}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                {r.second.img ? (
                  <img src={r.second.img} alt={r.second.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: partyColor(r.second.party) }}>
                    {r.second.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{r.second.name}</p>
                  <p className="text-[10px] text-[var(--muted)] truncate">{r.second.party}</p>
                </div>
                <span className="text-xs sm:text-sm tabular-nums shrink-0">{fmt(r.second.votes)}</span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-amber-200">
                <span className="text-[11px] text-amber-700 font-semibold tabular-nums">
                  Gap: {fmt(r.margin)} votes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
