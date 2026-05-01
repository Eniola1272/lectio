import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak, last30DaysDeltas } from "@/lib/stats";
import { SectionTitle } from "@/components/section-title";
import { StatCard } from "@/components/progress/stat-card";
import { ActivityBarChart } from "@/components/charts/activity-bar-chart";
import { Flame, Award } from "lucide-react";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("progress_history")
    .select("testament, book, chapter, chapter_index, recorded_at")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: true });

  const history = data ?? [];
  const deltas = last30DaysDeltas(history);
  const streak = computeStreak(history);

  const total30 = deltas.reduce((s, d) => s + d.chaptersAdvanced, 0);
  const activeDays = deltas.filter((d) => d.chaptersAdvanced > 0).length;
  const recent = [...history].reverse().slice(0, 12);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        <StatCard label="Chapters advanced" value={total30} sub="last 30 days" />
        <StatCard label="Active days" value={activeDays} sub="of last 30" />
        <StatCard
          label="Current streak"
          value={streak.current}
          sub="days in a row"
          icon={<Flame size={16} />}
        />
        <StatCard
          label="Longest streak"
          value={streak.longest}
          sub="personal best"
          icon={<Award size={16} />}
        />
      </div>

      <div
        className="p-4 sm:p-8"
        style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
      >
        <SectionTitle eyebrow="Rhythm" title="Last 30 days" />
        <div style={{ marginTop: 24 }}>
          <ActivityBarChart data={deltas} />
        </div>
      </div>

      <div>
        <SectionTitle eyebrow="History" title="Bookmark moves" />
        {recent.length === 0 ? (
          <div
            className="mt-6 p-12 text-center"
            style={{
              background: "#fbf6ea",
              border: "1px dashed #c9b890",
              color: "#7a5d3a",
              fontStyle: "italic",
            }}
          >
            No bookmark moves yet. Press <em>Move Bookmark</em> to begin.
          </div>
        ) : (
          <div className="mt-6">
            {recent.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 gap-2"
                style={{ borderBottom: "1px dotted #d4be96" }}
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 11,
                      color: "#7a5d3a",
                      flexShrink: 0,
                    }}
                  >
                    {new Date(e.recorded_at).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: 19,
                      fontStyle: "italic",
                      fontFamily: "Cormorant Garamond, serif",
                    }}
                  >
                    {e.book}
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 12,
                      color: e.testament === "old" ? "#a87132" : "#5d7a3a",
                    }}
                  >
                    ch. {e.chapter}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    color: "#a89070",
                    textTransform: "uppercase",
                  }}
                >
                  {e.testament === "old" ? "OT" : "NT"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
