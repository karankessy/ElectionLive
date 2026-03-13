'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { ElectionData } from '@/lib/types';
import StatCard from '@/components/StatCard';
import SeatMajorityTracker from '@/components/SeatMajorityTracker';
import PartyLeaderboard from '@/components/PartyLeaderboard';
import RSPTracker from '@/components/RSPTracker';
import ProvinceBreakdown from '@/components/ProvinceBreakdown';
import PopularCandidates from '@/components/PopularCandidates';
import SpotlightCard from '@/components/SpotlightCard';
import ThemeToggle from '@/components/ThemeToggle';
import ScrollToTop from '@/components/ScrollToTop';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function npt(iso: string) {
  return (
    new Date(iso).toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }) + ' NPT'
  );
}



export default function HomePage() {
  const { data, error, isLoading, mutate } = useSWR<ElectionData>(
    '/api/scrape?type=all',
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: false },
  );

  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-sm w-full">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="var(--accent)" />
            </svg>
            <p className="text-[var(--text)] text-sm font-semibold">Nepal Election 2082</p>
          </div>
          <p className="text-[var(--muted)] text-xs">Loading final results…</p>
          <div className="loading-bar mx-auto" style={{ maxWidth: 240 }} />
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-24 pop-in" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          <div className="skeleton h-40 pop-in mt-4 rounded-xl" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data?.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--red-bg)' }}>
            <span className="text-xl font-bold" style={{ color: 'var(--red)' }}>!</span>
          </div>
          <p className="font-semibold text-base" style={{ color: 'var(--red)' }}>Failed to load data</p>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            {error?.message ?? 'Unable to scrape election data. Try again shortly.'}
          </p>
          <button
            onClick={handleRetry}
            className="pill-btn pill-btn--active press-scale focus-ring mx-auto block mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { parties, provinces, rspCandidates, popularCandidates, overview, spotlight } = data;
  const MAJORITY = 83;
  const winnerParty = [...parties].sort((a, b) => b.total - a.total)[0];

  return (
    <main className="min-h-screen">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {winnerParty
          ? `Final results: ${winnerParty.name} wins with ${winnerParty.total} seats.`
          : 'Election results finalized.'}
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--border)] sticky-header">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="var(--green)" />
              <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text)]">
                Nepal Election 2082
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[var(--muted)]">
                Federal Parliament · FPTP · 165 Seats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end text-right">
            <div>
              {winnerParty && (
                <p className="text-[10px] sm:text-xs font-medium text-[var(--green)]">
                  <span className="hidden sm:inline">
                    {winnerParty.name} wins with{' '}
                    <span className="font-bold tabular-nums">{winnerParty.total}</span> seats
                  </span>
                  <span className="sm:hidden">
                    {winnerParty.name} wins ({winnerParty.total})
                  </span>
                </p>
              )}
              <p className="text-[10px] sm:text-[11px] text-[var(--muted)]">
                Final Results · {npt(data.timestamp)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex badge" style={{ background: 'var(--green-bg)', color: 'var(--green-text)', borderColor: 'var(--green-border)' }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Final
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {spotlight && spotlight.candidates.length > 0 && (
          <SpotlightCard race={spotlight} />
        )}

        <section
          aria-label="Election overview"
          className="stat-strip grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          <StatCard label="Results Declared" value={overview.declared} sub={`of ${overview.totalSeats} seats`} color="var(--green)" />
          <StatCard label="Remaining" value={overview.counting} sub={`of ${overview.totalSeats} seats`} color={overview.counting > 0 ? 'var(--amber)' : 'var(--green)'} />
          <StatCard label="Parties with Seats" value={parties.filter(p => p.total > 0).length} sub={`of ${overview.totalParties} contesting`} />
          <StatCard label="Majority Mark" value={MAJORITY} sub={`of ${overview.totalSeats} seats`} color="#7c3aed" />
        </section>

        <SeatMajorityTracker parties={parties} />

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <section aria-label="Final results" className="space-y-5 min-w-0">
            <PartyLeaderboard parties={parties} baseline={parties} />
          </section>

          <aside aria-label="Party tracker" className="space-y-5 min-w-0">
            {rspCandidates?.length > 0 && (
              <RSPTracker candidates={rspCandidates} />
            )}
          </aside>
        </div>

        {provinces?.length > 0 && <ProvinceBreakdown provinces={provinces} />}

        {popularCandidates?.length > 0 && (
          <section aria-label="Featured constituency battles">
            <PopularCandidates races={popularCandidates} />
          </section>
        )}

        <footer className="pt-6 sm:pt-8 mt-4 border-t border-[var(--border)] text-center space-y-2">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Data sourced from <a href="https://election.ekantipur.com" target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text)] transition-colors">election.ekantipur.com</a> — for informational purposes only.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Built by{' '}
            <a href="https://karanregmi.com.np" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              Karan Regmi
            </a>
          </p>
        </footer>
      </div>

      <ScrollToTop />
    </main>
  );
}
