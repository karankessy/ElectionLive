'use client';

import { SpotlightRace } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  race: SpotlightRace;
}

export default function SpotlightCard({ race }: Props) {
  const top = race.candidates[0];
  const second = race.candidates[1];
  if (!top) return null;

  const margin = top && second ? top.votes - second.votes : top.votes;
  const totalVotes = race.candidates.reduce((s, c) => s + c.votes, 0);

  return (
    <section aria-label={`Spotlight race: ${race.constituency}`} className="card card--spotlight">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="badge" style={{ background: 'var(--blue-bg)', color: 'var(--blue-text)', borderColor: 'var(--blue-border)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Spotlight
          </span>
          <h2 className="text-sm sm:text-base font-semibold text-[var(--text)]">{race.constituency}</h2>
        </div>
        <span className="text-[11px] sm:text-xs text-[var(--muted)] tabular-nums">
          {fmt(totalVotes)} total votes
        </span>
      </div>

      {/* Main matchup */}
      {second ? (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center mb-5">
          <CandidateBlock candidate={top} side="left" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
              vs
            </span>
            <div className="w-px h-4 sm:h-6 bg-[var(--border)]" />
            <span className="text-[11px] sm:text-xs font-bold text-[var(--green)] tabular-nums">
              +{fmt(margin)}
            </span>
          </div>
          <CandidateBlock candidate={second} side="right" />
        </div>
      ) : (
        <div className="mb-5">
          <CandidateBlock candidate={top} side="left" />
        </div>
      )}

      {/* Vote bar */}
      {second && totalVotes > 0 && (
        <div className="mb-4">
          <div className="flex rounded-lg overflow-hidden h-3 sm:h-4 gap-0.5" style={{ background: 'var(--bar-track)' }}>
            <div
              className="bar-segment rounded-l-lg"
              style={{
                flex: top.votes,
                background: partyColor(top.party),
                transition: 'flex 0.5s ease',
              }}
            />
            <div
              className="bar-segment rounded-r-lg"
              style={{
                flex: second.votes,
                background: partyColor(second.party),
                transition: 'flex 0.5s ease',
              }}
            />
            {totalVotes - top.votes - second.votes > 0 && (
              <div
                className="bar-segment"
                style={{
                  flex: totalVotes - top.votes - second.votes,
                  background: 'var(--others-color)',
                  transition: 'flex 0.5s ease',
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] sm:text-[11px] font-medium tabular-nums" style={{ color: partyColor(top.party) }}>
              {((top.votes / totalVotes) * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium tabular-nums" style={{ color: partyColor(second.party) }}>
              {((second.votes / totalVotes) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Other candidates */}
      {race.candidates.length > 2 && (
        <OtherCandidates candidates={race.candidates.slice(2)} />
      )}
    </section>
  );
}

/* ── Candidate block ── */
function CandidateBlock({
  candidate,
  side,
}: {
  candidate: SpotlightRace['candidates'][0];
  side: 'left' | 'right';
}) {
  const color = partyColor(candidate.party);
  const align = side === 'right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${align} gap-1.5 sm:gap-2`}>
      <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        {candidate.img ? (
          <img
            src={candidate.img}
            alt={candidate.name}
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover ring-2 shrink-0 transition-transform duration-150 hover:scale-105"
            style={{ borderColor: color }}
          />
        ) : (
          <div
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full shrink-0 flex items-center justify-center text-lg sm:text-2xl font-bold text-white"
            style={{ background: color }}
          >
            {candidate.name.charAt(0)}
          </div>
        )}
        {candidate.partyImg && (
          <img
            src={candidate.partyImg}
            alt=""
            className="w-5 h-5 sm:w-7 sm:h-7 rounded object-contain shrink-0" style={{ background: 'var(--img-bg)' }}
          />
        )}
      </div>

      <div>
        <p className="text-sm sm:text-lg font-semibold text-[var(--text)] leading-tight">
          {candidate.name}
        </p>
        <p className="text-[11px] sm:text-xs text-[var(--muted)]">{candidate.party}</p>
      </div>

      <div>
        <p className="text-lg sm:text-2xl font-bold tabular-nums" style={{ color }}>
          {fmt(candidate.votes)}
        </p>
        {candidate.isLeading && (
          <span className="badge mt-1" style={{ background: 'var(--green-bg)', color: 'var(--green-text)', borderColor: 'var(--green-border)' }}>
            Leading
          </span>
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
    <div className="border-t pt-3 mt-1" style={{ borderColor: 'var(--blue-border)' }}>
      <p className="text-[10px] sm:text-[11px] text-[var(--muted)] uppercase tracking-wider mb-2 font-semibold">
        Other candidates
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {shown.map(c => (
          <div key={c.id} className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: partyColor(c.party) }}
            />
            <span className="text-[var(--text-secondary)] truncate max-w-[90px] sm:max-w-[110px]">{c.name}</span>
            <span className="font-semibold tabular-nums text-[var(--text)]">{fmt(c.votes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
