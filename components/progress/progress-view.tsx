"use client";

import { useProgress, type ProgressRow } from "@/lib/queries/use-progress";
import { computeStats } from "@/lib/stats";
import { BIBLE, TOTAL_CH } from "@/lib/bible";
import { LinearDial } from "@/components/progress/linear-dial";
import { BookList } from "@/components/progress/book-list";
import { SectionTitle } from "@/components/section-title";

interface ProgressViewProps {
  userId: string;
  initialProgress: ProgressRow | null;
}

export function ProgressView({ userId, initialProgress }: ProgressViewProps) {
  const { data: progress } = useProgress(userId, initialProgress);

  const otIdx = progress?.ot_chapter_index ?? 0;
  const ntIdx = progress?.nt_chapter_index ?? 0;
  const stats = computeStats(otIdx, ntIdx);

  return (
    <div className="space-y-10">
      {/* Linear dials */}
      <div
        className="p-8"
        style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
      >
        <div
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#7a5d3a",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {stats.total} of {TOTAL_CH} chapters covered ·{" "}
          {stats.totalPct.toFixed(1)}% of the Bible
        </div>
        <LinearDial
          otChapterIndex={otIdx}
          ntChapterIndex={ntIdx}
          stats={stats}
          otBook={progress?.ot_book ?? undefined}
          otChapter={progress?.ot_chapter ?? undefined}
          ntBook={progress?.nt_book ?? undefined}
          ntChapter={progress?.nt_chapter ?? undefined}
        />
      </div>

      {/* Book-by-book */}
      <div>
        <SectionTitle eyebrow="Detail" title="Book by book" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mt-6">
          <BookList
            title="Old Testament"
            books={BIBLE.old}
            currentChapterIndex={otIdx}
          />
          <BookList
            title="New Testament"
            books={BIBLE.new}
            currentChapterIndex={ntIdx}
          />
        </div>
      </div>
    </div>
  );
}
