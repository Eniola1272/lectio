import { describe, it, expect } from "vitest";
import {
  computeStatsFromPosition,
  computeStreak,
  last30DaysDeltas,
  type HistoryEntry,
} from "./stats";
import { TOTAL_CH, TOTAL_OT_CH, TOTAL_NT_CH, chapterIndex } from "./bible";

// ── computeStatsFromPosition ──────────────────────────────────────────────────

describe("computeStatsFromPosition", () => {
  it("returns zeros for index 0", () => {
    const s = computeStatsFromPosition(0);
    expect(s.total).toBe(0);
    expect(s.ot).toBe(0);
    expect(s.nt).toBe(0);
    expect(s.totalPct).toBe(0);
  });

  it("Genesis 1 = 1 OT chapter covered", () => {
    const idx = chapterIndex("Genesis", 1); // should be 1
    expect(idx).toBe(1);
    const s = computeStatsFromPosition(idx);
    expect(s.ot).toBe(1);
    expect(s.nt).toBe(0);
    expect(s.total).toBe(1);
  });

  it("end of OT (Malachi 4) = all 929 OT, 0 NT", () => {
    const idx = chapterIndex("Malachi", 4);
    expect(idx).toBe(TOTAL_OT_CH);
    const s = computeStatsFromPosition(idx);
    expect(s.ot).toBe(TOTAL_OT_CH);
    expect(s.nt).toBe(0);
    expect(s.otPct).toBeCloseTo(100);
    expect(s.ntPct).toBe(0);
    expect(s.chaptersLeftInTestament).toBe(0);
  });

  it("Matthew 1 (first NT chapter) = full OT + 1 NT chapter", () => {
    const idx = chapterIndex("Matthew", 1);
    expect(idx).toBe(TOTAL_OT_CH + 1);
    const s = computeStatsFromPosition(idx);
    expect(s.ot).toBe(TOTAL_OT_CH);
    expect(s.nt).toBe(1);
    expect(s.ntPct).toBeCloseTo((1 / TOTAL_NT_CH) * 100);
    expect(s.chaptersLeftInTestament).toBe(TOTAL_NT_CH - 1);
  });

  it("Luke 1 = full OT + Matthew 28 + Mark 16 NT chapters", () => {
    const idx = chapterIndex("Luke", 1);
    const ntCovered = 28 + 16 + 1; // Matthew + Mark + Luke 1
    const s = computeStatsFromPosition(idx);
    expect(s.ot).toBe(TOTAL_OT_CH);
    expect(s.nt).toBe(ntCovered);
    expect(s.chaptersLeftInTestament).toBe(TOTAL_NT_CH - ntCovered);
  });

  it("Revelation 22 (last chapter) = 100%", () => {
    const idx = chapterIndex("Revelation", 22);
    expect(idx).toBe(TOTAL_CH);
    const s = computeStatsFromPosition(idx);
    expect(s.total).toBe(TOTAL_CH);
    expect(s.totalPct).toBeCloseTo(100);
    expect(s.chaptersLeftInBible).toBe(0);
  });

  it("chaptersLeftInBible is correct mid-journey", () => {
    const idx = chapterIndex("Genesis", 50); // end of Genesis
    const s = computeStatsFromPosition(idx);
    expect(s.chaptersLeftInBible).toBe(TOTAL_CH - 50);
  });
});

// ── computeStreak ─────────────────────────────────────────────────────────────

function makeHistory(dates: string[]): HistoryEntry[] {
  return dates.map((d, i) => ({
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

  it("calculates delta correctly for single day", () => {
    const history: HistoryEntry[] = [
      { book: "Genesis", chapter: 5, chapter_index: 5, recorded_at: today + "T09:00:00" },
      { book: "Genesis", chapter: 10, chapter_index: 10, recorded_at: today + "T20:00:00" },
    ];
    const r = last30DaysDeltas(history);
    const todayEntry = r.find((d) => d.date === today);
    // max that day = 10, max before = 0 → delta = 10
    expect(todayEntry?.chaptersAdvanced).toBe(10);
  });

  it("does not count backwards movement", () => {
    const history: HistoryEntry[] = [
      { book: "Genesis", chapter: 10, chapter_index: 10, recorded_at: yesterday + "T09:00:00" },
      { book: "Genesis", chapter: 8, chapter_index: 8, recorded_at: today + "T09:00:00" },
    ];
    const r = last30DaysDeltas(history);
    const todayEntry = r.find((d) => d.date === today);
    expect(todayEntry?.chaptersAdvanced).toBe(0);
  });
});
