'use client';

import { useEffect, useRef, useState } from 'react';
import { SpotlightRace } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  race: SpotlightRace;
}

export default function SpotlightCard({ race }: Props) {
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!barRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) setBarWidth(entry.contentRect.width);
    });
    obs.observe(barRef.current);
    return () => obs.disconnect();
  }, []);

  const top = race.candidates[0];
  const second = race.candidates[1];
  if (!top) return null;

  const margin = top && second ? top.votes - second.votes : top.votes;
  const totalVotes = race.candidates.reduce((s, c) => s + c.votes, 0);
  const c1 = partyColor(top.party);
  const c2 = second ? partyColor(second.party) : '#888';
  const topPct = totalVotes > 0 ? ((top.votes / totalVotes) * 100).toFixed(1) : '0';
  const secPct = totalVotes > 0 && second ? ((second.votes / totalVotes) * 100).toFixed(1) : '0';
  const showBarLabels = barWidth > 300;

  return (
    <section aria-label={`Spotlight race: ${race.constituency}`} className="card !p-0 overflow-hidden border-[var(--border)]">
      {/* Thin animated accent bar */}
      <div className="relative h-[3px] overflow-hidden">
        <div className="absolute inset-0 flex">
          <div style={{
            flex: mounted ? (top.votes || 1) : 0,
            background: c1,
            transition: 'flex 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
          {second && <div style={{
            flex: mounted ? (second.votes || 1) : 0,
            background: c2,
            transition: 'flex 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 100ms',
          }} />}
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5">
        {/* === MAIN BATTLE with constituency centered === */}
        {second ? (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center">
            <CandidateBlock candidate={top} side="left" totalVotes={totalVotes} color={c1} />

            <div className="flex flex-col items-center text-center px-1 sm:px-3 min-w-[80px] sm:min-w-[120px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2" style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--green-text)' }}>Winner</span>
              </span>
              <h2 className="text-sm sm:text-lg font-bold text-[var(--text)] leading-tight">{race.constituency}</h2>
              <p className="text-[10px] sm:text-xs text-[var(--muted)] mt-1 tabular-nums">{fmt(totalVotes)} votes</p>

              <div className="w-8 h-px my-2.5 sm:my-3" style={{ background: 'var(--border)' }} />

              <span
                className="text-base sm:text-xl font-bold tabular-nums leading-none"
                style={{ color: 'var(--green)' }}
              >
                +{fmt(margin)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[var(--muted)] mt-0.5 uppercase tracking-wider font-medium">margin</span>
            </div>

            <CandidateBlock candidate={second} side="right" totalVotes={totalVotes} color={c2} />
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">{race.constituency}</h2>
            </div>
            <CandidateBlock candidate={top} side="left" totalVotes={totalVotes} color={c1} />
          </div>
        )}

        {/* === VOTE BAR === */}
        {second && totalVotes > 0 && (
          <div className="mt-5 sm:mt-6">
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: c1 }} />
                <span className="text-[11px] sm:text-xs font-bold tabular-nums" style={{ color: c1 }}>{topPct}%</span>
                <span className="text-[10px] text-[var(--muted)] hidden sm:inline">{top.party}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[var(--muted)] hidden sm:inline">{second.party}</span>
                <span className="text-[11px] sm:text-xs font-bold tabular-nums" style={{ color: c2 }}>{secPct}%</span>
                <div className="w-2 h-2 rounded-sm" style={{ background: c2 }} />
              </div>
            </div>
            <div ref={barRef} className="relative flex rounded-md overflow-hidden h-4 sm:h-5">
              <div
                className="flex items-center justify-center"
                style={{
                  flex: mounted ? top.votes || 1 : 0,
                  background: c1,
                  transition: 'flex 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {showBarLabels && (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/85 tabular-nums">
                    {fmt(top.votes)}
                  </span>
                )}
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  flex: mounted ? second.votes || 1 : 0,
                  background: c2,
                  opacity: 0.7,
                  transition: 'flex 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 50ms',
                }}
              >
                {showBarLabels && second.votes > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/85 tabular-nums">
                    {fmt(second.votes)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other candidates */}
        {race.candidates.length > 2 && (
          <OtherCandidates candidates={race.candidates.slice(2)} />
        )}
      </div>
    </section>
  );
}

/* ── Candidate block ── */
function CandidateBlock({
  candidate,
  side,
  totalVotes,
  color,
}: {
  candidate: SpotlightRace['candidates'][0];
  side: 'left' | 'right';
  totalVotes: number;
  color: string;
}) {
  const align = side === 'right' ? 'text-right items-end' : 'text-left items-start';
  const pct = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : '0';

  return (
    <div className={`flex flex-col ${align} gap-1.5 sm:gap-2`}>
      {/* Photo + party symbol */}
      <div className={`flex items-end gap-1.5 sm:gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="relative">
          {candidate.img ? (
            <img
              src={candidate.img}
              alt={candidate.name}
              className="w-12 h-12 sm:w-[72px] sm:h-[72px] rounded-full object-cover ring-2 shrink-0"
              style={{ '--tw-ring-color': color, '--tw-ring-opacity': '0.5' } as React.CSSProperties}
            />
          ) : (
            <div
              className="w-12 h-12 sm:w-[72px] sm:h-[72px] rounded-full shrink-0 flex items-center justify-center text-lg sm:text-2xl font-bold text-white"
              style={{ background: color }}
            >
              {candidate.name.charAt(0)}
            </div>
          )}
          {candidate.isLeading && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[1.5px] flex items-center justify-center"
              style={{ background: 'var(--green)', borderColor: 'var(--surface)' }}
              title="Winner"
            >
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </div>
        {candidate.partyImg && (
          <img
            src={candidate.partyImg}
            alt=""
            className="w-5 h-5 sm:w-7 sm:h-7 rounded object-contain shrink-0 border border-[var(--border)]"
            style={{ background: 'var(--img-bg)' }}
          />
        )}
      </div>

      {/* Name + Party */}
      <div>
        <p className="text-xs sm:text-base font-semibold text-[var(--text)] leading-snug">
          {candidate.name}
        </p>
        <p className="text-[10px] sm:text-xs text-[var(--muted)]">{candidate.party}</p>
      </div>

      {/* Votes */}
      <div>
        <p className="text-base sm:text-xl font-bold tabular-nums leading-none" style={{ color }}>
          {fmt(candidate.votes)}
        </p>
        {totalVotes > 0 && (
          <p className="text-[10px] sm:text-[11px] text-[var(--muted)] tabular-nums mt-0.5">
            {pct}% votes
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Other candidates ── */
function OtherCandidates({ candidates }: { candidates: SpotlightRace['candidates'] }) {
  const shown = candidates.filter(c => c.votes > 0).slice(0, 5);
  if (shown.length === 0) return null;

  return (
    <div className="border-t pt-3 mt-4" style={{ borderColor: 'var(--border)' }}>
      <p className="text-[10px] sm:text-[11px] text-[var(--muted)] uppercase tracking-wider mb-2 font-medium">
        Other candidates
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {shown.map(c => (
          <div key={c.id} className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: partyColor(c.party) }}
            />
            <span className="text-[var(--text-secondary)] truncate max-w-[100px] sm:max-w-[130px]">{c.name}</span>
            <span className="font-semibold tabular-nums text-[var(--text)]">{fmt(c.votes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
