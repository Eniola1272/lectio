import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStatsFromPosition, computeStreak } from "@/lib/stats";
import { BIBLE, TOTAL_CH } from "@/lib/bible";
import { StatCard } from "@/components/progress/stat-card";
import { BookList } from "@/components/progress/book-list";
import { SectionTitle } from "@/components/section-title";
import { LinearDial } from "@/components/progress/linear-dial";
import { AppNav } from "@/components/app-nav";
import { Flame, Award } from "lucide-react";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const [{ data: progressData }, { data: historyData }] = await Promise.all([
    supabase
      .from("reading_progress")
      .select("book, chapter, chapter_index")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("progress_history")
      .select("book, chapter, chapter_index, recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true }),
  ]);

  const chapterIdx = progressData?.chapter_index ?? 0;
  const stats = computeStatsFromPosition(chapterIdx);
  const streak = computeStreak(historyData ?? []);

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <AppNav userId={user.id} currentIndex={chapterIdx} />

        <div className="space-y-10">
          {/* Linear dial */}
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
              chapterIndex={chapterIdx}
              stats={stats}
              book={progressData?.book}
              chapter={progressData?.chapter}
            />
          </div>

          {/* Streak cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <StatCard
              label="Current Streak"
              value={streak.current}
              sub="days in a row"
              icon={<Flame size={16} />}
            />
            <StatCard
              label="Longest Streak"
              value={streak.longest}
              sub="personal best"
              icon={<Award size={16} />}
            />
            <StatCard
              label="Left in Testament"
              value={stats.chaptersLeftInTestament}
              sub={chapterIdx <= 929 ? "OT chapters" : "NT chapters"}
            />
            <StatCard
              label="Left in Bible"
              value={stats.chaptersLeftInBible}
              sub="chapters remaining"
            />
          </div>

          {/* Book-by-book */}
          <div>
            <SectionTitle eyebrow="Detail" title="Book by book" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mt-6">
              <BookList
                title="Old Testament"
                books={BIBLE.old}
                currentChapterIndex={chapterIdx}
              />
              <BookList
                title="New Testament"
                books={BIBLE.new}
                currentChapterIndex={chapterIdx}
              />
            </div>
          </div>
        </div>

        <footer
          className="mt-20 pt-8 text-center"
          style={{
            borderTop: "1px solid #c9b890",
            fontFamily: "DM Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#a89070",
            textTransform: "uppercase",
          }}
        >
          ✦ &nbsp; 1189 chapters &nbsp;·&nbsp; 66 books &nbsp;·&nbsp; one
          journey &nbsp; ✦
        </footer>
      </div>
    </div>
  );
}
