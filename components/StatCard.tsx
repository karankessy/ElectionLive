'use client';

import { useEffect, useState } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({ label, value, sub, color }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = setTimeout(() => setMounted(true), 80); return () => clearTimeout(id); }, []);

  return (
    <div className="card cursor-default relative overflow-hidden">
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 h-[2px] transition-all duration-700 ease-out"
        style={{
          width: mounted ? '100%' : '0%',
          background: color || 'var(--accent)',
          opacity: 0.5,
        }}
      />
      <p className="text-[11px] sm:text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className="text-2xl sm:text-3xl font-bold tabular-nums leading-tight transition-opacity duration-500"
        style={{
          ...(color ? { color } : {}),
          opacity: mounted ? 1 : 0,
        }}
      >
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </p>
      {sub && (
        <p className="text-[11px] sm:text-xs text-[var(--muted)] mt-1 tabular-nums">{sub}</p>
      )}
    </div>
  );
}
