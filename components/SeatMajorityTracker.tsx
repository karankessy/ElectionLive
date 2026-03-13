'use client';

import { useEffect, useRef, useState } from 'react';
import { Party } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

const TOTAL_SEATS = 165;
const MAJORITY = 83;

interface Props {
  parties: Party[];
}

export default function SeatMajorityTracker({ parties }: Props) {
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Measure bar width for responsive label logic
  useEffect(() => {
    if (!barRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) setBarWidth(entry.contentRect.width);
    });
    obs.observe(barRef.current);
    return () => obs.disconnect();
  }, []);

  const top = parties.filter(p => p.total > 0).slice(0, 10);
  const otherTotal = parties.filter(p => p.total > 0).slice(10).reduce((s, p) => s + p.total, 0);
  const filled = parties.reduce((s, p) => s + p.total, 0);
  const filledPct = Math.round((filled / TOTAL_SEATS) * 100);

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

  // Determine if a segment is wide enough for a label (dynamically based on bar pixel width)
  const minLabelPx = 32; // minimum pixels to show a count label
  const canShowLabel = (widthPct: number) => barWidth > 0 && (widthPct / 100) * barWidth >= minLabelPx;
  const canShowName = (widthPct: number) => barWidth > 0 && (widthPct / 100) * barWidth >= 80;

  // Check if leader has crossed majority
  const leader = segments[0];
  const leaderCrossedMajority = leader && leader.count >= MAJORITY;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="section-title !mb-0">Final Seat Distribution</p>
          {leaderCrossedMajority && (
            <span className="badge inline-flex items-center gap-1" style={{ background: 'var(--green-bg)', color: 'var(--green-text)', borderColor: 'var(--green-border)' }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Majority Secured
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] sm:text-xs text-[var(--muted)] tabular-nums">
            {filled} / {TOTAL_SEATS} declared ({filledPct}%)
          </span>
          <span className="text-[11px] sm:text-xs font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
            Majority: {MAJORITY}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div
        ref={barRef}
        className="relative h-8 sm:h-10 rounded-lg overflow-hidden mb-1.5"
        style={{ background: 'var(--bar-track)' }}
        role="img"
        aria-label={`Seat distribution: ${segments.map(s => `${s.name} ${s.count}`).join(', ')}. Majority line at ${MAJORITY}.`}
      >
        {positioned.map((seg, i) => {
          const w = mounted ? seg.width : 0;
          const l = mounted ? seg.left : 0;
          return (
            <div
              key={seg.key}
              className="absolute top-0 bottom-0 group cursor-pointer"
              style={{
                left: `${l}%`,
                width: `${w}%`,
                background: seg.color,
                transition: 'left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${i * 50}ms`,
                zIndex: 1,
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[var(--text)] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
                <span className="font-bold">{seg.name}</span>: {seg.count} ({((seg.count / TOTAL_SEATS) * 100).toFixed(1)}%)
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: 'var(--text)' }} />
              </div>
              {/* Label inside segment */}
              {canShowName(seg.width) ? (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white/90 truncate px-1.5 pointer-events-none gap-1">
                  <span className="truncate">{seg.name}</span>
                  <span className="tabular-nums shrink-0">{seg.count}</span>
                </span>
              ) : canShowLabel(seg.width) ? (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white/85 tabular-nums pointer-events-none">
                  {seg.count}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* Majority line — dashed with glow */}
        <div
          className="absolute top-0 bottom-0 z-10 flex flex-col items-center"
          style={{ left: `${majorityPct}%` }}
        >
          <div
            className="w-0.5 h-full"
            style={{
              background: 'var(--text)',
              opacity: 0.8,
              boxShadow: '0 0 6px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      </div>

      {/* Majority label */}
      <div className="relative h-5 mb-4">
        <span
          className="absolute text-[10px] sm:text-xs text-[var(--muted)] tabular-nums font-medium flex items-center gap-1"
          style={{ left: `${majorityPct}%`, transform: 'translateX(-50%)' }}
        >
          <span className="hidden sm:inline">↑ {MAJORITY} for majority</span>
          <span className="sm:hidden">↑ {MAJORITY}</span>
        </span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 sm:gap-x-5 gap-y-1.5">
        {segments.map((seg, i) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-[11px] sm:text-xs group cursor-default">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-[var(--text-secondary)] truncate max-w-[100px] sm:max-w-[130px]">{seg.name}</span>
            <span className="font-semibold tabular-nums text-[var(--text)]">{fmt(seg.count)}</span>
            {i === 0 && leader && (
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                {((leader.count / TOTAL_SEATS) * 100).toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
