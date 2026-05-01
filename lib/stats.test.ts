import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { computeStats, computeStreak, last30Days, type Entry } from "./stats";
import { TOTAL_CH, TOTAL_OT_CH, TOTAL_NT_CH } from "./bible";

function makeEntry(
  read_at: string,
  testament: "old" | "new" = "old",
  book = "Genesis",
  chapter = 1
): Entry {
  return { testament, book, chapter, read_at };
}

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const today = dateOffset(0);
const yesterday = dateOffset(1);
const twoDaysAgo = dateOffset(2);
const threeDaysAgo = dateOffset(3);

// ── computeStats ──────────────────────────────────────────────────────────────

describe("computeStats", () => {
  it("returns zeros for empty entries", () => {
    const s = computeStats([]);
    expect(s).toEqual({ ot: 0, nt: 0, total: 0, otPct: 0, ntPct: 0, totalPct: 0 });
  });

  it("counts unique OT chapters", () => {
    const entries: Entry[] = [
      makeEntry(today, "old", "Genesis", 1),
      makeEntry(today, "old", "Genesis", 1), // duplicate
      makeEntry(today, "old", "Genesis", 2),
    ];
    const s = computeStats(entries);
    expect(s.ot).toBe(2);
    expect(s.nt).toBe(0);
    expect(s.total).toBe(2);
  });

  it("counts unique NT chapters", () => {
    const entries: Entry[] = [
      makeEntry(today, "new", "Matthew", 1),
      makeEntry(today, "new", "John", 3),
    ];
    const s = computeStats(entries);
    expect(s.nt).toBe(2);
    expect(s.ot).toBe(0);
  });

  it("computes correct percentages", () => {
    const entries: Entry[] = [makeEntry(today, "old", "Genesis", 1)];
    const s = computeStats(entries);
    expect(s.otPct).toBeCloseTo((1 / TOTAL_OT_CH) * 100);
    expect(s.totalPct).toBeCloseTo((1 / TOTAL_CH) * 100);
  });

  it("handles mix of OT and NT", () => {
    const entries: Entry[] = [
      makeEntry(today, "old", "Genesis", 1),
      makeEntry(today, "new", "Matthew", 1),
    ];
    const s = computeStats(entries);
    expect(s.ot).toBe(1);
    expect(s.nt).toBe(1);
    expect(s.total).toBe(2);
  });
});

// ── computeStreak ─────────────────────────────────────────────────────────────

describe("computeStreak", () => {
  it("returns zeros for no entries", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("current=1 when only today has an entry", () => {
    const r = computeStreak([makeEntry(today)]);
    expect(r.current).toBe(1);
    expect(r.longest).toBe(1);
  });

  it("current=1 when only yesterday has an entry (streak still alive)", () => {
    const r = computeStreak([makeEntry(yesterday)]);
    expect(r.current).toBe(1);
  });

  it("current=0 when last entry was 2+ days ago", () => {
    const r = computeStreak([makeEntry(twoDaysAgo)]);
    expect(r.current).toBe(0);
  });

  it("consecutive days build current streak", () => {
    const entries = [
      makeEntry(today),
      makeEntry(yesterday),
      makeEntry(twoDaysAgo),
    ];
    const r = computeStreak(entries);
    expect(r.current).toBe(3);
    expect(r.longest).toBe(3);
  });

  it("gap resets current streak but preserves longest", () => {
    const entries = [
      makeEntry(today),
      makeEntry(yesterday),
      // gap
      makeEntry(dateOffset(5)),
      makeEntry(dateOffset(6)),
      makeEntry(dateOffset(7)),
    ];
    const r = computeStreak(entries);
    expect(r.current).toBe(2);
    expect(r.longest).toBe(3);
  });

  it("longest streak is not broken by a gap", () => {
    const entries = [
      makeEntry(dateOffset(10)),
      makeEntry(dateOffset(9)),
      makeEntry(dateOffset(8)),
      makeEntry(dateOffset(7)),
      // gap of 3
      makeEntry(dateOffset(3)),
      makeEntry(dateOffset(2)),
    ];
    const r = computeStreak(entries);
    expect(r.longest).toBe(4);
    expect(r.current).toBe(0); // last read was 2 days ago, not today/yesterday
  });

  it("duplicates across days don't inflate streak", () => {
    const entries = [
      makeEntry(today, "old", "Genesis", 1),
      makeEntry(today, "old", "Genesis", 2),
      makeEntry(yesterday, "old", "Exodus", 1),
    ];
    const r = computeStreak(entries);
    expect(r.current).toBe(2);
  });

  it("single entry yesterday: current=1", () => {
    const r = computeStreak([makeEntry(yesterday)]);
    expect(r.current).toBe(1);
    expect(r.longest).toBe(1);
  });
});

// ── last30Days ────────────────────────────────────────────────────────────────

describe("last30Days", () => {
  it("returns 30 entries", () => {
    expect(last30Days([])).toHaveLength(30);
  });

  it("all counts are 0 for no entries", () => {
    const result = last30Days([]);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it("counts chapters on the correct day", () => {
    const entries = [makeEntry(today), makeEntry(today)];
    const result = last30Days(entries);
    const todayEntry = result.find((d) => d.date === today);
    expect(todayEntry?.count).toBe(2);
  });

  it("ignores entries older than 30 days", () => {
    const old = dateOffset(35);
    const result = last30Days([makeEntry(old)]);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });

  it("entries are in ascending date order", () => {
    const result = last30Days([]);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true);
    }
  });
});
