const PARTY_COLORS: Record<string, string> = {
  'Nepali Congress': '#16a34a',
  'CPN-UML': '#dc2626',
  'CPN (Maoist Centre)': '#991b1b',
  'Nepali Communist Party': '#b91c1c',
  'Nepal Communist Party (Maoist)': '#7f1d1d',
  'Rastriya Swatantra Party': '#38bdf8',
  'Rastriya Prajatantra Party': '#f59e0b',
  'Janata Samajwadi Party': '#06b6d4',
  'Janata Samjbadi Party-Nepal': '#0891b2',
  'Janamat Party': '#8b5cf6',
  'Nagarik Unmukti Party': '#ec4899',
  'CPN (Unified Socialist)': '#f97316',
  'Loktantrik Samajwadi Party': '#14b8a6',
  'Shram Sanskriti Party': '#84cc16',
  'Ujaylo Nepal Party': '#10b981',
  'Independent': '#64748b',
};

const FNV_PRIME = 16777619;

function hashColor(name: string): string {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = (hash * FNV_PRIME) >>> 0;
  }
  const h = hash % 360;
  return `hsl(${h}, 55%, 55%)`;
}

export function partyColor(name: string): string {
  const exact = PARTY_COLORS[name];
  if (exact) return exact;
  for (const [k, c] of Object.entries(PARTY_COLORS)) {
    const key = k.toLowerCase().split(' ')[0];
    if (name.toLowerCase().includes(key)) return c;
  }
  return hashColor(name);
}

export function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}
