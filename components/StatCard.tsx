'use client';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({ label, value, sub, color }: Props) {
  return (
    <div className="card cursor-default">
      <p className="text-[11px] sm:text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className="text-2xl sm:text-3xl font-bold tabular-nums leading-tight"
        style={color ? { color } : undefined}
      >
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </p>
      {sub && (
        <p className="text-[11px] sm:text-xs text-[var(--muted)] mt-1 tabular-nums">{sub}</p>
      )}
    </div>
  );
}
