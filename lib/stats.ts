import { TOTAL_CH, TOTAL_NT_CH, TOTAL_OT_CH } from "./bible";

export interface Entry {
  testament: "old" | "new";
  book: string;
  chapter: number;
  read_at: string; // YYYY-MM-DD
}

export interface Stats {
  ot: number;
  nt: number;
  total: number;
  otPct: number;
  ntPct: number;
  totalPct: number;
}

export interface StreakResult {
  current: number;
  longest: number;
}

export interface DayCount {
  date: string;
  count: number;
  label: string;
}

export function computeStats(entries: Entry[]): Stats {
  const unique = new Set(
    entries.map((e) => `${e.testament}|${e.book}|${e.chapter}`)
  );
  let ot = 0,
    nt = 0;
  unique.forEach((k) => {
    k.startsWith("old|") ? ot++ : nt++;
  });
  return {
    ot,
    nt,
    total: ot + nt,
    otPct: (ot / TOTAL_OT_CH) * 100,
    ntPct: (nt / TOTAL_NT_CH) * 100,
    totalPct: ((ot + nt) / TOTAL_CH) * 100,
  };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoToDate(iso: string): Date {
  // Parse as UTC midnight to avoid timezone shifting
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function diffDays(a: string, b: string): number {
  return (isoToDate(b).getTime() - isoToDate(a).getTime()) / 86400000;
}

export function computeStreak(entries: Entry[]): StreakResult {
  if (!entries.length) return { current: 0, longest: 0 };

  const days = [...new Set(entries.map((e) => e.read_at))].sort();

  // Longest streak via single pass
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (diffDays(days[i - 1], days[i]) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak: walk backwards from today
  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yISO = yesterday.toISOString().slice(0, 10);

  const set = new Set(days);

  if (!set.has(today) && !set.has(yISO)) {
    return { current: 0, longest };
  }

  // Start from today if read today, else from yesterday
  let cursor = set.has(today) ? today : yISO;
  let current = 0;
  while (set.has(cursor)) {
    current++;
    const d = isoToDate(cursor);
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }

  return { current, longest: Math.max(longest, current) };
}

export function last30Days(entries: Entry[]): DayCount[] {
  const map: Record<string, number> = {};
  for (let d = 29; d >= 0; d--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    map[dt.toISOString().slice(0, 10)] = 0;
  }
  entries.forEach((e) => {
    if (e.read_at in map) map[e.read_at]++;
  });
  return Object.entries(map).map(([date, count]) => ({
    date,
    count,
    label: new Date(date + "T12:00:00").toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
  }));
}
