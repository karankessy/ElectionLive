'use client';

import { useState } from 'react';
import { RSPCandidate } from '@/lib/types';
import { fmt } from '@/lib/utils';

interface Props {
  candidates: RSPCandidate[];
}

export default function RSPTracker({ candidates }: Props) {
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('all');

  const provinces = [...new Set(candidates.map(c => c.province).filter(Boolean))].sort();

  const filtered = candidates.filter(c => {
    if (
      query &&
      !c.name.toLowerCase().includes(query.toLowerCase()) &&
      !c.constituency.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    if (province !== 'all' && c.province !== province) return false;
    return true;
  });

  const isFiltered = query !== '' || province !== 'all';

  return (
    <div className="card">
      <p className="section-title">RSP — Rastriya Swatantra Party</p>

      <div className="flex gap-2.5 mb-4">
        <input
          className="flex-1 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm sm:text-base text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-150"
          placeholder="Search name or constituency…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search RSP candidates by name or constituency"
        />
        <select
          className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm sm:text-base text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-150"
          value={province}
          onChange={e => setProvince(e.target.value)}
          aria-label="Filter RSP candidates by province"
        >
          <option value="all">All Provinces</option>
          {provinces.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {isFiltered && (
        <p className="text-xs sm:text-sm text-[var(--muted)] mb-2.5 tabular-nums">
          {filtered.length === 0
            ? 'No results found'
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      <div className="max-h-80 overflow-y-auto space-y-0 pr-1">
        {filtered.length === 0 ? (
          <p className="text-[var(--muted)] text-sm sm:text-base py-6 text-center">No results found</p>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              className="row-hover flex items-center gap-3.5 py-3 px-2.5 border-b border-[var(--border)] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-[var(--text)] truncate">{c.name}</p>
                <p className="text-xs sm:text-sm text-[var(--muted)] truncate">
                  {c.constituency} · {c.district}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm sm:text-base font-bold tabular-nums text-[var(--text)]">{fmt(c.votes)}</p>
                <span
                  className="badge text-xs inline-flex items-center gap-1"
                  style={{ background: 'var(--green-bg)', color: 'var(--green-text)', borderColor: 'var(--green-border)' }}
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="tabular-nums">+{fmt(c.leadMargin)}</span> won
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-3 pt-2 border-t border-[var(--border)] text-xs sm:text-sm text-[var(--muted)] text-right tabular-nums">
        {filtered.length} of {candidates.length} candidates
      </p>
    </div>
  );
}
