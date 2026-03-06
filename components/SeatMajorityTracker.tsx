'use client';

import { Party } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

const TOTAL_SEATS = 165;
const MAJORITY = 83;

interface Props {
  parties: Party[];
}

export default function SeatMajorityTracker({ parties }: Props) {
  const top = parties.filter(p => p.total > 0).slice(0, 10);
  const otherTotal = parties.filter(p => p.total > 0).slice(10).reduce((s, p) => s + p.total, 0);
  const filled = parties.reduce((s, p) => s + p.total, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <p className="section-title mb-0">Seat Distribution</p>
        <span className="text-xs text-[var(--muted)]">
          {filled} / {TOTAL_SEATS} declared · Majority at {MAJORITY}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-8 flex rounded overflow-hidden mb-1">
        {top.map(p => (
          <div
            key={p.id}
            title={`${p.name}: ${p.total}`}
            style={{
              width: `${(p.total / TOTAL_SEATS) * 100}%`,
              background: partyColor(p.name),
              minWidth: p.total > 0 ? 3 : 0,
            }}
          />
        ))}
        {otherTotal > 0 && (
          <div
            title={`Others: ${otherTotal}`}
            style={{ width: `${(otherTotal / TOTAL_SEATS) * 100}%`, background: '#374151' }}
          />
        )}
        <div style={{ flex: 1, background: '#1f2937' }} />

        {/* Majority line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/80"
          style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%` }}
        />
      </div>

      {/* Majority label */}
      <div className="relative h-4 mb-3">
        <span
          className="absolute text-[10px] text-white/50 -translate-x-1/2"
          style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%` }}
        >
          ← {MAJORITY} majority
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {top.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: partyColor(p.name) }}
            />
            <span className="text-[var(--muted)] truncate max-w-[120px]">{p.name}</span>
            <span className="font-bold">{fmt(p.total)}</span>
          </div>
        ))}
        {otherTotal > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0 bg-[#374151]" />
            <span className="text-[var(--muted)]">Others</span>
            <span className="font-bold">{fmt(otherTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
