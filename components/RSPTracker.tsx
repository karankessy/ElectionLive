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

  return (
    <div className="card">
      <p className="section-title">RSP — Rastriya Swatantra Party Candidates</p>

      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded px-3 py-1.5 text-sm placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
          placeholder="Search name or constituency…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="bg-[var(--surface2)] border border-[var(--border)] rounded px-2 py-1.5 text-sm outline-none"
          value={province}
          onChange={e => setProvince(e.target.value)}
        >
          <option value="all">All Provinces</option>
          {provinces.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-0 pr-1">
        {filtered.length === 0 ? (
          <p className="text-[var(--muted)] text-sm py-6 text-center">No results found</p>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-[var(--muted)] truncate">
                  {c.constituency} · {c.district}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">{fmt(c.votes)}</p>
                <span
                  className={`badge ${
                    c.status === 'won'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  +{fmt(c.leadMargin)} {c.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-2 text-xs text-[var(--muted)] text-right">
        {filtered.length} of {candidates.length} candidates
      </p>
    </div>
  );
}
