import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStats, computeStreak, type Entry } from "@/lib/stats";
import { BIBLE, TOTAL_OT_CH, TOTAL_NT_CH } from "@/lib/bible";
import { StatCard } from "@/components/progress/stat-card";
import { BookList } from "@/components/progress/book-list";
import { SectionTitle } from "@/components/section-title";
import { RadialProgress } from "@/components/charts/radial-progress";
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

  const { data } = await supabase
    .from("reading_entries")
    .select("testament, book, chapter, read_at")
    .eq("user_id", user.id);

  const entries = (data ?? []) as Entry[];
  const stats = computeStats(entries);
  const streak = computeStreak(entries);

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <AppNav userId={user.id} />

        <div className="space-y-10">
          <div className="grid grid-cols-12 gap-6">
            <div
              className="col-span-12 md:col-span-5 p-8"
              style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
            >
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  color: "#7a5d3a",
                  textTransform: "uppercase",
                }}
              >
                Whole Bible
              </div>
              <RadialProgress pct={stats.totalPct} total={stats.total} />
            </div>

            <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-6">
              <StatCard
                label="Old Testament"
                value={`${stats.otPct.toFixed(1)}%`}
                sub={`${stats.ot} of ${TOTAL_OT_CH} ch`}
                pct={stats.otPct}
              />
              <StatCard
                label="New Testament"
                value={`${stats.ntPct.toFixed(1)}%`}
                sub={`${stats.nt} of ${TOTAL_NT_CH} ch`}
                pct={stats.ntPct}
              />
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
            </div>
          </div>

          <div>
            <SectionTitle eyebrow="Detail" title="Book by book" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mt-6">
              <BookList
                title="Old Testament"
                books={BIBLE.old}
                entries={entries}
                testament="old"
              />
              <BookList
                title="New Testament"
                books={BIBLE.new}
                entries={entries}
                testament="new"
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
