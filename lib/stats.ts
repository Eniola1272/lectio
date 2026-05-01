import { TOTAL_CH, TOTAL_NT_CH, TOTAL_OT_CH } from "./bible";

export interface Stats {
  ot: number;      // OT chapters covered
  nt: number;      // NT chapters covered
  total: number;   // total chapters covered
  otPct: number;
  ntPct: number;
  totalPct: number;
  chaptersLeftInTestament: number; // chapters left in whichever testament the position is in
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
  book: string;
  chapter: number;
  chapter_index: number;
  recorded_at: string;
}

/**
 * Compute stats from a single position in canonical Bible order.
 * chapterIndex is 1-based (1 = Genesis 1, 1189 = Revelation 22).
 * Everything from index 1 through chapterIndex is considered "covered".
 */
export function computeStatsFromPosition(chapterIdx: number): Stats {
  const total = Math.max(0, Math.min(chapterIdx, TOTAL_CH));
  const ot = Math.min(total, TOTAL_OT_CH);
  const nt = Math.max(0, total - TOTAL_OT_CH);

  const inOT = total <= TOTAL_OT_CH;
  const chaptersLeftInTestament = inOT
    ? TOTAL_OT_CH - total
    : TOTAL_NT_CH - nt;

  return {
    ot,
    nt,
    total,
    otPct: (ot / TOTAL_OT_CH) * 100,
    ntPct: (nt / TOTAL_NT_CH) * 100,
    totalPct: (total / TOTAL_CH) * 100,
    chaptersLeftInTestament,
    chaptersLeftInBible: TOTAL_CH - total,
  };
}

/**
 * Compute streak from history entries (consecutive calendar days with at least
 * one bookmark move).
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
 * Build a 30-day bar chart dataset from position history.
 * Each bar shows how many chapters the user advanced on that day
 * (delta from previous recorded position).
 */
export function last30DaysDeltas(history: HistoryEntry[]): DayDelta[] {
  const result: DayDelta[] = [];
  const sorted = [...history].sort((a, b) =>
    a.recorded_at.localeCompare(b.recorded_at)
  );

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

  // For each day in the window, find the highest index reached that day
  // vs the highest index reached before that day → delta
  const windowStart = result[0].date;

  for (const dayResult of result) {
    const endOfDay = dayResult.date + "T23:59:59";
    const startOfDay = dayResult.date + "T00:00:00";

    const maxThatDay = sorted
      .filter(
        (e) => e.recorded_at >= startOfDay && e.recorded_at <= endOfDay
      )
      .reduce((max, e) => Math.max(max, e.chapter_index), 0);

    const maxBefore = sorted
      .filter((e) => e.recorded_at < startOfDay)
      .reduce((max, e) => Math.max(max, e.chapter_index), 0);

    dayResult.chaptersAdvanced = Math.max(0, maxThatDay - maxBefore);
  }

  return result;
}
