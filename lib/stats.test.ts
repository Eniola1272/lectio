import { describe, it, expect } from "vitest";
import {
  computeStats,
  computeStreak,
  last30DaysDeltas,
  type HistoryEntry,
} from "./stats";
import { TOTAL_CH, TOTAL_OT_CH, TOTAL_NT_CH } from "./bible";

// ── computeStats ──────────────────────────────────────────────────────────────

describe("computeStats", () => {
  it("returns zeros when both indices are 0", () => {
    const s = computeStats(0, 0);
    expect(s.ot).toBe(0);
    expect(s.nt).toBe(0);
    expect(s.total).toBe(0);
    expect(s.totalPct).toBe(0);
  });

  it("Genesis 1 in OT only (otIdx=1, ntIdx=0)", () => {
    const s = computeStats(1, 0);
    expect(s.ot).toBe(1);
    expect(s.nt).toBe(0);
    expect(s.total).toBe(1);
    expect(s.otChaptersLeft).toBe(TOTAL_OT_CH - 1);
    expect(s.ntChaptersLeft).toBe(TOTAL_NT_CH);
  });

  it("full OT + no NT", () => {
    const s = computeStats(TOTAL_OT_CH, 0);
    expect(s.ot).toBe(TOTAL_OT_CH);
    expect(s.nt).toBe(0);
    expect(s.otPct).toBeCloseTo(100);
    expect(s.ntPct).toBe(0);
    expect(s.otChaptersLeft).toBe(0);
    expect(s.ntChaptersLeft).toBe(TOTAL_NT_CH);
    expect(s.chaptersLeftInBible).toBe(TOTAL_NT_CH);
  });

  it("no OT + Matthew 1 in NT (ntIdx=1)", () => {
    const s = computeStats(0, 1);
    expect(s.ot).toBe(0);
    expect(s.nt).toBe(1);
    expect(s.ntPct).toBeCloseTo((1 / TOTAL_NT_CH) * 100);
  });

  it("full OT + full NT = 100% Bible", () => {
    const s = computeStats(TOTAL_OT_CH, TOTAL_NT_CH);
    expect(s.total).toBe(TOTAL_CH);
    expect(s.totalPct).toBeCloseTo(100);
    expect(s.chaptersLeftInBible).toBe(0);
  });

  it("independent mid-point positions", () => {
    const s = computeStats(100, 50);
    expect(s.ot).toBe(100);
    expect(s.nt).toBe(50);
    expect(s.total).toBe(150);
    expect(s.chaptersLeftInBible).toBe(TOTAL_CH - 150);
  });

  it("caps OT and NT at their respective totals", () => {
    const s = computeStats(9999, 9999);
    expect(s.ot).toBe(TOTAL_OT_CH);
    expect(s.nt).toBe(TOTAL_NT_CH);
    expect(s.total).toBe(TOTAL_CH);
  });
});

// ── computeStreak ─────────────────────────────────────────────────────────────

function makeHistory(dates: string[], testament: "old" | "new" = "old"): HistoryEntry[] {
  return dates.map((d, i) => ({
    testament,
    book: "Genesis",
    chapter: i + 1,
    chapter_index: i + 1,
    recorded_at: d + "T10:00:00",
  }));
}

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const today = dateOffset(0);
const yesterday = dateOffset(1);

describe("computeStreak", () => {
  it("empty history = 0", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("only today = current 1", () => {
    const r = computeStreak(makeHistory([today]));
    expect(r.current).toBe(1);
    expect(r.longest).toBe(1);
  });

  it("today + yesterday = current 2", () => {
    const r = computeStreak(makeHistory([today, yesterday]));
    expect(r.current).toBe(2);
  });

  it("gap resets current but preserves longest", () => {
    const r = computeStreak(
      makeHistory([today, yesterday, dateOffset(5), dateOffset(6), dateOffset(7)])
    );
    expect(r.current).toBe(2);
    expect(r.longest).toBe(3);
  });

  it("no activity today or yesterday = current 0", () => {
    const r = computeStreak(makeHistory([dateOffset(3), dateOffset(4)]));
    expect(r.current).toBe(0);
    expect(r.longest).toBe(2);
  });

  it("mixed OT and NT entries count as one reading day", () => {
    const mixed = [
      ...makeHistory([today], "old"),
      ...makeHistory([today], "new"),
    ];
    const r = computeStreak(mixed);
    expect(r.current).toBe(1);
  });
});

// ── last30DaysDeltas ──────────────────────────────────────────────────────────

describe("last30DaysDeltas", () => {
  it("returns 30 entries", () => {
    expect(last30DaysDeltas([])).toHaveLength(30);
  });

  it("all zeros for empty history", () => {
    const r = last30DaysDeltas([]);
    expect(r.every((d) => d.chaptersAdvanced === 0)).toBe(true);
  });

  it("calculates OT delta correctly", () => {
    const history: HistoryEntry[] = [
      { testament: "old", book: "Genesis", chapter: 5, chapter_index: 5, recorded_at: today + "T09:00:00" },
      { testament: "old", book: "Genesis", chapter: 10, chapter_index: 10, recorded_at: today + "T20:00:00" },
    ];
    const r = last30DaysDeltas(history);
    const todayEntry = r.find((d) => d.date === today);
    expect(todayEntry?.chaptersAdvanced).toBe(10);
  });

  it("sums OT and NT deltas on the same day", () => {
    const history: HistoryEntry[] = [
      { testament: "old", book: "Genesis", chapter: 5, chapter_index: 5, recorded_at: today + "T09:00:00" },
      { testament: "new", book: "Matthew", chapter: 3, chapter_index: 3, recorded_at: today + "T20:00:00" },
    ];
    const r = last30DaysDeltas(history);
    const todayEntry = r.find((d) => d.date === today);
    // OT delta = 5, NT delta = 3 → total = 8
    expect(todayEntry?.chaptersAdvanced).toBe(8);
  });

  it("does not count backwards movement", () => {
    const history: HistoryEntry[] = [
      { testament: "old", book: "Genesis", chapter: 10, chapter_index: 10, recorded_at: yesterday + "T09:00:00" },
      { testament: "old", book: "Genesis", chapter: 8, chapter_index: 8, recorded_at: today + "T09:00:00" },
    ];
    const r = last30DaysDeltas(history);
    const todayEntry = r.find((d) => d.date === today);
    expect(todayEntry?.chaptersAdvanced).toBe(0);
  });
});
