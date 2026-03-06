'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { ChangeEvent, ElectionData } from '@/lib/types';
import StatCard from '@/components/StatCard';
import SeatMajorityTracker from '@/components/SeatMajorityTracker';
import PartyLeaderboard from '@/components/PartyLeaderboard';
import RSPTracker from '@/components/RSPTracker';
import ProvinceBreakdown from '@/components/ProvinceBreakdown';
import PopularCandidates from '@/components/PopularCandidates';
import CloseRaces from '@/components/CloseRaces';
import RecentChangesFeed from '@/components/RecentChangesFeed';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function npt(iso: string) {
  return (
    new Date(iso).toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      dateStyle: 'medium',
      timeStyle: 'short',
    }) + ' NPT'
  );
}

export default function HomePage() {
  const { data, error, isLoading } = useSWR<ElectionData>(
    '/api/scrape?type=all',
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false },
  );

  const [baseline, setBaseline] = useState<ElectionData['parties']>([]);
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const prevRef = useRef<ElectionData['parties']>([]);

  useEffect(() => {
    if (!data?.parties) return;
    if (prevRef.current.length === 0) {
      prevRef.current = data.parties;
      setBaseline(data.parties);
      return;
    }
    const newChanges: ChangeEvent[] = [];
    for (const p of data.parties) {
      const prev = prevRef.current.find(x => x.id === p.id);
      if (prev && p.total !== prev.total) {
        newChanges.push({ party: p.name, delta: p.total - prev.total, at: data.timestamp });
      }
    }
    if (newChanges.length > 0) {
      setChanges(c => [...newChanges, ...c].slice(0, 50));
    }
    prevRef.current = data.parties;
  }, [data]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="live-dot mx-auto" />
          <p className="text-[var(--muted)] text-sm">Loading live election data…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data?.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-sm">
          <p className="text-rose-400 font-semibold mb-1">Failed to load data</p>
          <p className="text-[var(--muted)] text-sm">
            {error?.message ?? 'Unable to scrape election data. Try again shortly.'}
          </p>
        </div>
      </div>
    );
  }

  const { parties, provinces, rspCandidates, popularCandidates, overview } = data;
  const MAJORITY = 83;
  const leadingParty = [...parties].sort((a, b) => b.total - a.total)[0];

  return (
    <main className="min-h-screen">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#0a0e1a]/90 backdrop-blur">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="live-dot" />
            <div>
              <h1 className="text-sm font-bold leading-none">Nepal Election 2082</h1>
              <p className="text-[10px] text-[var(--muted)]">
                Federal Parliament · FPTP · 165 Seats
              </p>
            </div>
          </div>
          <div className="text-right">
            {leadingParty && (
              <p className="text-xs font-semibold text-emerald-400">
                {leadingParty.name} leads — {leadingParty.total} seats
              </p>
            )}
            <p className="text-[10px] text-[var(--muted)]">Updated {npt(data.timestamp)}</p>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Results Declared"
            value={overview.declared}
            sub={`of ${overview.totalSeats} seats`}
            color="#38bdf8"
          />
          <StatCard
            label="Still Counting"
            value={overview.counting}
            color="#f59e0b"
          />
          <StatCard label="Parties Active" value={overview.totalParties} />
          <StatCard
            label="Majority Mark"
            value={MAJORITY}
            sub="seats needed to govern"
            color="#a78bfa"
          />
        </div>

        {/* ── Seat bar ── */}
        <SeatMajorityTracker parties={parties} />

        {/* ── Party leaderboard ── */}
        <PartyLeaderboard parties={parties} baseline={baseline} />

        {/* ── Recent changes ── */}
        {changes.length > 0 && <RecentChangesFeed changes={changes} />}

        {/* ── Close races ── */}
        {popularCandidates?.length > 0 && <CloseRaces races={popularCandidates} />}

        {/* ── Province breakdown ── */}
        {provinces?.length > 0 && <ProvinceBreakdown provinces={provinces} />}

        {/* ── RSP tracker ── */}
        {rspCandidates?.length > 0 && <RSPTracker candidates={rspCandidates} />}

        {/* ── Popular candidates / battles ── */}
        {popularCandidates?.length > 0 && <PopularCandidates races={popularCandidates} />}

        <footer className="pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted)]">
          Data sourced from election.ekantipur.com — for informational purposes only. Auto-refreshes every 60 seconds.
        </footer>
      </div>
    </main>
  );
}
