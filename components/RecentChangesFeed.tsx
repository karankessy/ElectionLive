'use client';

import { ChangeEvent } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  changes: ChangeEvent[];
}

export default function RecentChangesFeed({ changes }: Props) {
  if (changes.length === 0) return null;

  return (
    <div className="card">
      <p className="section-title">Recent Changes</p>
      <div className="max-h-64 overflow-y-auto space-y-0 pr-1">
        {changes.map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 py-2.5 border-b border-[var(--border)] last:border-0"
          >
            <span
              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
              style={{ background: partyColor(c.party) }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{c.party}</span>{' '}
                {c.delta > 0 ? (
                  <span className="text-emerald-400">+{fmt(c.delta)} seat{c.delta !== 1 ? 's' : ''}</span>
                ) : (
                  <span className="text-rose-400">{fmt(c.delta)} seat{Math.abs(c.delta) !== 1 ? 's' : ''}</span>
                )}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {new Date(c.at).toLocaleTimeString('en-US', {
                  timeZone: 'Asia/Kathmandu',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                NPT
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
