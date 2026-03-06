'use client';

import { ChangeEvent } from '@/lib/types';
import { partyColor, fmt } from '@/lib/utils';

interface Props {
  changes: ChangeEvent[];
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

export default function RecentChangesFeed({ changes }: Props) {
  return (
    <div className="card">
      <p className="section-title">Recent Changes</p>

      {changes.length === 0 ? (
        <p className="text-[var(--muted)] text-xs sm:text-sm py-4 text-center">
          No seat changes in this window
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-0 pr-1">
          {changes.map((c, i) => (
            <div
              key={i}
              className="row-hover flex items-start gap-2.5 py-2.5 px-2 border-b border-[var(--border)] last:border-0"
              style={{
                animation: i === 0 ? 'fadeSlideIn 0.3s ease both' : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm mt-1 shrink-0"
                style={{ background: partyColor(c.party) }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[var(--text)]">
                  <span className="font-semibold">{c.party}</span>{' '}
                  {c.delta > 0 ? (
                    <span className="text-[var(--green)] font-medium tabular-nums">
                      +{fmt(c.delta)} seat{c.delta !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-[var(--red)] font-medium tabular-nums">
                      {fmt(c.delta)} seat{Math.abs(c.delta) !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[var(--muted)] tabular-nums">
                  {nptShort(c.at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
