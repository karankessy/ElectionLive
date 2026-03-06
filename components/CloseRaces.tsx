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

  if (close.length === 0) return null;

  return (
    <div className="card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
      <p className="section-title" style={{ color: '#f59e0b' }}>
        ⚠ Close Races — Margin under {fmt(CLOSE_THRESHOLD)} votes ({close.length} seats)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {close.map(r => (
          <div
            key={r.constituency}
            className="rounded-lg p-3 border"
            style={{
              background: 'rgba(245,158,11,0.05)',
              borderColor: 'rgba(245,158,11,0.2)',
            }}
          >
            <p className="text-xs font-semibold text-amber-300 mb-2 truncate">
              {r.constituency}
            </p>

            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: partyColor(r.top.party) }}
              />
              <span className="text-xs flex-1 truncate">{r.top.name}</span>
              <span className="text-xs font-bold">{fmt(r.top.votes)}</span>
            </div>

            <div className="flex items-center gap-2 opacity-60">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: partyColor(r.second.party) }}
              />
              <span className="text-xs flex-1 truncate">{r.second.name}</span>
              <span className="text-xs">{fmt(r.second.votes)}</span>
            </div>

            <p className="text-[11px] text-amber-400 font-bold mt-2">Gap: {fmt(r.margin)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
