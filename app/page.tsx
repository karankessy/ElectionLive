'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { ChangeEvent, ElectionData } from '@/lib/types';
import StatCard from '@/components/StatCard';
import SeatMajorityTracker from '@/components/SeatMajorityTracker';
import PartyLeaderboard from '@/components/PartyLeaderboard';
import RSPTracker from '@/components/RSPTracker';
import ProvinceBreakdown from '@/components/ProvinceBreakdown';
import PopularCandidates from '@/components/PopularCandidates';
import RecentChangesFeed from '@/components/RecentChangesFeed';
import SpotlightCard from '@/components/SpotlightCard';
import ThemeToggle from '@/components/ThemeToggle';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const REFRESH_INTERVAL = 60_000;

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

function nptShort(iso: string) {
  return (
    new Date(iso).toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: 'numeric',
      minute: '2-digit',
    }) + ' NPT'
  );
}

/* ── Countdown ring SVG ── */
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - seconds / total);
  return (
    <svg width="22" height="22" className="countdown-ring" aria-hidden="true">
      <circle cx="11" cy="11" r={r} stroke="var(--ring-track)" strokeWidth="2" />
      <circle
        cx="11"
        cy="11"
        r={r}
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

export default function HomePage() {
  const { data, error, isLoading, mutate } = useSWR<ElectionData>(
    '/api/scrape?type=all',
    fetcher,
    { refreshInterval: REFRESH_INTERVAL, revalidateOnFocus: false },
  );

  const [baseline, setBaseline] = useState<ElectionData['parties']>([]);
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [changedPartyIds, setChangedPartyIds] = useState<Set<number>>(new Set());
  const prevRef = useRef<ElectionData['parties']>([]);
  const [countdown, setCountdown] = useState(60);
  const lastFetchRef = useRef(Date.now());

  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastFetchRef.current) / 1000);
      setCountdown(Math.max(0, 60 - elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!data?.parties) return;

    lastFetchRef.current = Date.now();
    setCountdown(60);

    if (prevRef.current.length === 0) {
      prevRef.current = data.parties;
      setBaseline(data.parties);
      return;
    }

    const newChanges: ChangeEvent[] = [];
    const newChangedIds = new Set<number>();

    for (const p of data.parties) {
      const prev = prevRef.current.find(x => x.id === p.id);
      if (prev && p.total !== prev.total) {
        newChanges.push({ party: p.name, delta: p.total - prev.total, at: data.timestamp });
        newChangedIds.add(p.id);
      }
    }

    if (newChanges.length > 0) {
      setChanges(c => [...newChanges, ...c].slice(0, 50));
      setChangedPartyIds(newChangedIds);
      setTimeout(() => setChangedPartyIds(new Set()), 1500);
    }

    const leadingParty = [...data.parties].sort((a, b) => b.total - a.total)[0];
    if (leadingParty) {
      setLiveAnnouncement(
        `Results updated at ${nptShort(data.timestamp)}. ${leadingParty.name} leads with ${leadingParty.total} seats.`
      );
    }

    prevRef.current = data.parties;
  }, [data]);

  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-xs w-full">
          <div className="live-dot mx-auto" />
          <p className="text-[var(--text)] text-sm font-medium">Loading live election data…</p>
          <p className="text-[var(--muted)] text-xs">Fetching latest counts from the Election Commission</p>
          <div className="loading-bar mx-auto" style={{ maxWidth: 200 }} />
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-24 pop-in" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
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
  const leadingParty = [...parties].sort((a, b) => b.total - a.total)[0];

  return (
    <main className="min-h-screen">
      {/* aria-live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] sticky-header">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="live-dot" />
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-[var(--text)]">
                Nepal Election 2082
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[var(--muted)]">
                Federal Parliament · FPTP · 165 Seats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end text-right">
            <div>
              {leadingParty && (
                <p className="text-[11px] sm:text-xs font-medium text-[var(--green)]">
                  <span className="hidden sm:inline">
                    {leadingParty.name} leads with{' '}
                    <span className="font-semibold tabular-nums">{leadingParty.total}</span> seats
                  </span>
                  <span className="sm:hidden">
                    {leadingParty.name} leads ({leadingParty.total})
                  </span>
                </p>
              )}
              <p className="text-[10px] text-[var(--muted)]">
                Updated {npt(data.timestamp)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <span className="badge" style={{ background: 'var(--red-bg)', color: 'var(--red-text)', borderColor: 'var(--red-border)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Live
                </span>
                <div className="flex items-center gap-1.5">
                  <CountdownRing seconds={countdown} total={60} />
                  <span className="text-[11px] text-[var(--muted)] tabular-nums">
                    {countdown > 0 ? `${countdown}s` : 'Refreshing…'}
                  </span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* ── Spotlight ── */}
        {spotlight && spotlight.candidates.length > 0 && (
          <SpotlightCard race={spotlight} />
        )}

        {/* ── Overview stats ── */}
        <section
          aria-label="Election overview"
          className="stat-strip grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          <StatCard label="Results Declared" value={overview.declared} sub={`of ${overview.totalSeats} seats`} color="var(--accent)" />
          <StatCard label="Still Counting" value={overview.counting} sub={`of ${overview.totalSeats} seats`} color="var(--amber)" />
          <StatCard label="Parties Active" value={overview.totalParties} sub={`contesting ${overview.totalSeats} seats`} />
          <StatCard label="Majority Mark" value={MAJORITY} sub={`of ${overview.totalSeats} seats`} color="#7c3aed" />
        </section>

        {/* ── Main layout ── */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          {/* Left */}
          <section aria-label="National results" className="space-y-6 min-w-0">
            <SeatMajorityTracker parties={parties} />
            <PartyLeaderboard parties={parties} baseline={baseline} changedIds={changedPartyIds} />
          </section>

          {/* Right */}
          <aside aria-label="Live changes and key races" className="space-y-6 min-w-0">
            <RecentChangesFeed changes={changes} />
            {rspCandidates?.length > 0 && (
              <RSPTracker candidates={rspCandidates} />
            )}
          </aside>
        </div>

        {/* ── Province Breakdown (full-width) ── */}
        {provinces?.length > 0 && <ProvinceBreakdown provinces={provinces} />}

        {/* ── Featured candidates ── */}
        {popularCandidates?.length > 0 && (
          <section aria-label="Featured constituency battles">
            <PopularCandidates races={popularCandidates} />
          </section>
        )}

        <footer className="pt-6 sm:pt-8 mt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] leading-relaxed">
          Data sourced from election.ekantipur.com — for informational purposes only. Auto-refreshes every 60 seconds.
        </footer>
      </div>
    </main>
  );
}
