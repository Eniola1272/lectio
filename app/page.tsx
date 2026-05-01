import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStats, computeStreak } from "@/lib/stats";
import { StatCard } from "@/components/progress/stat-card";
import { ProgressView } from "@/components/progress/progress-view";
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
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("progress_history")
      .select("testament, book, chapter, chapter_index, recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true }),
  ]);

  const otIdx = progressData?.ot_chapter_index ?? 0;
  const ntIdx = progressData?.nt_chapter_index ?? 0;
  const stats = computeStats(otIdx, ntIdx);
  const streak = computeStreak(historyData ?? []);

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <AppNav userId={user.id} initialProgress={progressData ?? null} />

        <div className="space-y-10">
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
              label="OT left"
              value={stats.otChaptersLeft}
              sub="chapters remaining"
            />
            <StatCard
              label="NT left"
              value={stats.ntChaptersLeft}
              sub="chapters remaining"
            />
          </div>

          {/* Progress dials + book list — client component for instant updates */}
          <ProgressView
            userId={user.id}
            initialProgress={progressData ?? null}
          />
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
