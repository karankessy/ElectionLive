'use client';

import { useEffect, useState } from 'react';
import { PopularRace } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

const CLOSE_THRESHOLD = 1500;

interface Props {
  races: PopularRace[];
}

function CandidateAvatar({ name, img, party, size = 'md', isWinner = false }: { name: string; img?: string; party: string; size?: 'sm' | 'md'; isWinner?: boolean }) {
  const cls = size === 'sm' ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-11 h-11 sm:w-12 sm:h-12';
  const color = partyColor(party);

  if (img) {
    return (
      <div className="relative shrink-0">
        <img
          src={img}
          alt={name}
          className={`${cls} rounded-full object-cover ring-2`}
          style={{ '--tw-ring-color': color, '--tw-ring-opacity': '0.4' } as React.CSSProperties}
        />
        {isWinner ? (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
            style={{ background: 'var(--green)', borderColor: 'var(--surface)' }}
            title="Winner"
          >
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ) : (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
            style={{ background: color, borderColor: 'var(--surface)' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div
        className={`${cls} rounded-full flex items-center justify-center text-sm font-bold text-white`}
        style={{ background: color }}
      >
        {name.charAt(0)}
      </div>
      {isWinner && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ background: 'var(--green)', borderColor: 'var(--surface)' }}
          title="Winner"
        >
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
    </div>
  );
}

export default function PopularCandidates({ races }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const enriched = races
    .map(race => {
      const withVotes = race.candidates.filter(c => c.votes > 0);
      const sorted = (withVotes.length > 0 ? withVotes : race.candidates).sort((a, b) => b.votes - a.votes);
      const top = sorted[0];
      const second = sorted[1];
      const margin = top && second ? top.votes - second.votes : Infinity;
      const isClose = margin > 0 && margin < CLOSE_THRESHOLD;
      const totalVotes = top && second ? top.votes + second.votes : 0;
      return { race, sorted, top, second, margin, isClose, totalVotes };
    })
    .filter(r => r.sorted.length > 0);

  const withVotesRaces = enriched.filter(r => r.totalVotes > 0);
  const zeroVotesRaces = enriched.filter(r => r.totalVotes === 0);

  const ordered = [
    ...withVotesRaces.filter(r => r.isClose).sort((a, b) => a.margin - b.margin),
    ...withVotesRaces.filter(r => !r.isClose),
    ...zeroVotesRaces,
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="section-title !mb-0">Constituency Results</p>
          <span className="text-[10px] tabular-nums font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-alt)', color: 'var(--muted)' }}>
            {ordered.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {ordered.map(({ race, sorted, top, totalVotes }) => {
          return (
            <div
              key={race.constituency}
              className="inner-card hover-lift !p-0 overflow-hidden"
            >

              <div className="p-3 sm:p-4">
                {/* Constituency name + close badge */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase truncate" style={{ color: 'var(--muted)' }}>
                    {race.constituency}
                  </p>
                  {top && top.votes > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 inline-flex items-center gap-1" style={{ background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      WON
                    </span>
                  )}
                </div>

                {/* Candidates */}
                <div className="space-y-3">
                  {sorted.slice(0, 2).map((c, idx) => {
                    const isLeader = idx === 0;
                    const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                    const color = partyColor(c.party);

                    return (
                      <div key={c.id}>
                        <div className="flex items-center gap-2.5">
                          <CandidateAvatar name={c.name} img={c.img || undefined} party={c.party} size={isLeader ? 'md' : 'sm'} isWinner={isLeader && c.votes > 0} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <p
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  isLeader ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                                }`}
                              >
                                {c.name}
                              </p>
                              <p
                                className={`text-sm sm:text-base font-bold tabular-nums shrink-0 ${
                                  isLeader ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                                }`}
                              >
                                {fmt(c.votes)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] sm:text-xs text-[var(--muted)] truncate">{c.party}</p>
                              {totalVotes > 0 && (
                                <p className="text-[10px] sm:text-xs tabular-nums text-[var(--muted)] shrink-0">{pct}%</p>
                              )}
                            </div>

                            {/* Mini vote bar */}
                            {totalVotes > 0 && (
                              <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: mounted ? `${pct}%` : '0%',
                                    background: color,
                                    opacity: isLeader ? 1 : 0.5,
                                    transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
