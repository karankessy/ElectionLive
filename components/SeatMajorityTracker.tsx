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

  // Build segments: each has a name, count, and color
  const segments: { key: string; name: string; count: number; color: string }[] = [
    ...top.map(p => ({ key: String(p.id), name: p.name, count: p.total, color: partyColor(p.name) })),
    ...(otherTotal > 0 ? [{ key: 'others', name: 'Others', count: otherTotal, color: 'var(--others-color)' }] : []),
  ];

  // Compute absolute left% for each segment
  let cursor = 0;
  const positioned = segments.map(seg => {
    const left = (cursor / TOTAL_SEATS) * 100;
    const width = (seg.count / TOTAL_SEATS) * 100;
    cursor += seg.count;
    return { ...seg, left, width };
  });

  const majorityPct = (MAJORITY / TOTAL_SEATS) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="section-title !mb-0">Seat Distribution</p>
        <span className="text-[11px] sm:text-xs text-[var(--muted)] tabular-nums">
          {filled} / {TOTAL_SEATS} declared · Majority at {MAJORITY}
        </span>
      </div>

      {/* Bar */}
      <div
        className="relative h-8 sm:h-10 rounded-lg overflow-hidden mb-1"
        style={{ background: 'var(--bar-track)' }}
        role="img"
        aria-label={`Seat distribution: ${segments.map(s => `${s.name} ${s.count}`).join(', ')}. Majority line at ${MAJORITY}.`}
      >
        {positioned.map((seg, i) => (
          <div
            key={seg.key}
            className="absolute top-0 bottom-0 group cursor-pointer"
            style={{
              left: `${seg.left}%`,
              width: `${seg.width}%`,
              background: seg.color,
              transition: 'left 0.5s ease, width 0.5s ease',
              transitionDelay: `${i * 20}ms`,
              zIndex: 1,
            }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[var(--text)] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
              {seg.name}: {seg.count} seat{seg.count !== 1 ? 's' : ''}
            </div>
            {/* Label inside segment if wide enough */}
            {seg.width > 8 && (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-semibold text-white/90 truncate px-1 pointer-events-none">
                {seg.count}
              </span>
            )}
          </div>
        ))}

        {/* Majority line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 z-10"
          style={{
            left: `${majorityPct}%`,
            background: 'var(--text)',
            opacity: 0.7,
          }}
        />
      </div>

      {/* Majority label */}
      <div className="relative h-5 mb-4">
        <span
          className="absolute text-[10px] sm:text-[11px] text-[var(--muted)] tabular-nums font-medium"
          style={{ left: `${majorityPct}%`, transform: 'translateX(-50%)' }}
        >
          <span className="hidden sm:inline">← {MAJORITY} majority</span>
          <span className="sm:hidden">{MAJORITY}</span>
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-[var(--text-secondary)] truncate max-w-[100px] sm:max-w-[130px]">{seg.name}</span>
            <span className="font-semibold tabular-nums text-[var(--text)]">{fmt(seg.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
