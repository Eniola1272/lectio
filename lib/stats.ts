import { TOTAL_CH, TOTAL_NT_CH, TOTAL_OT_CH } from "./bible";
import type { Testament } from "./bible";

export interface Stats {
  ot: number;
  nt: number;
  total: number;
  otPct: number;
  ntPct: number;
  totalPct: number;
  otChaptersLeft: number;
  ntChaptersLeft: number;
  chaptersLeftInBible: number;
}

export interface StreakResult {
  current: number;
  longest: number;
}

export interface DayDelta {
  date: string;
  chaptersAdvanced: number;
  label: string;
}

export interface HistoryEntry {
  testament: Testament;
  book: string;
  chapter: number;
  chapter_index: number; // testament-relative (OT: 1-929, NT: 1-260)
  recorded_at: string;
}

/**
 * Compute stats from two independent testament positions.
 * otIdx: 1-929 (0 = not started), ntIdx: 1-260 (0 = not started).
 */
export function computeStats(otIdx: number, ntIdx: number): Stats {
  const ot = Math.max(0, Math.min(otIdx, TOTAL_OT_CH));
  const nt = Math.max(0, Math.min(ntIdx, TOTAL_NT_CH));
  const total = ot + nt;
  return {
    ot,
    nt,
    total,
    otPct: (ot / TOTAL_OT_CH) * 100,
    ntPct: (nt / TOTAL_NT_CH) * 100,
    totalPct: (total / TOTAL_CH) * 100,
    otChaptersLeft: TOTAL_OT_CH - ot,
    ntChaptersLeft: TOTAL_NT_CH - nt,
    chaptersLeftInBible: TOTAL_CH - total,
  };
}

/**
 * Compute streak from history entries (consecutive calendar days with at least
 * one bookmark move, either testament).
 */
export function computeStreak(entries: HistoryEntry[]): StreakResult {
  if (!entries.length) return { current: 0, longest: 0 };

  const days = [
    ...new Set(entries.map((e) => e.recorded_at.slice(0, 10))),
  ].sort();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff =
      (new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) /
      86400000;
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const set = new Set(days);

  if (!set.has(today) && !set.has(yesterday)) return { current: 0, longest };

  let cursor = set.has(today) ? today : yesterday;
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = new Date(new Date(cursor).getTime() - 86400000)
      .toISOString()
      .slice(0, 10);
  }

  return { current, longest: Math.max(longest, current) };
}

/**
 * Build a 30-day delta dataset.
 * Each day shows total chapters advanced across both testaments.
 * chapter_index values are testament-relative so OT and NT deltas are computed
 * independently and then summed.
 */
export function last30DaysDeltas(history: HistoryEntry[]): DayDelta[] {
  const result: DayDelta[] = [];
  const sorted = [...history].sort((a, b) =>
    a.recorded_at.localeCompare(b.recorded_at)
  );
  const otEntries = sorted.filter((e) => e.testament === "old");
  const ntEntries = sorted.filter((e) => e.testament === "new");

  for (let d = 29; d >= 0; d--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    const date = dt.toISOString().slice(0, 10);
    result.push({
      date,
      chaptersAdvanced: 0,
      label: new Date(date + "T12:00:00").toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
    });
  }

  for (const dayResult of result) {
    const endOfDay = dayResult.date + "T23:59:59";
    const startOfDay = dayResult.date + "T00:00:00";

    const delta = (entries: HistoryEntry[]) => {
      const maxDay = entries
        .filter((e) => e.recorded_at >= startOfDay && e.recorded_at <= endOfDay)
        .reduce((max, e) => Math.max(max, e.chapter_index), 0);
      const maxBefore = entries
        .filter((e) => e.recorded_at < startOfDay)
        .reduce((max, e) => Math.max(max, e.chapter_index), 0);
      return Math.max(0, maxDay - maxBefore);
    };

    dayResult.chaptersAdvanced = delta(otEntries) + delta(ntEntries);
  }

  return result;
}
