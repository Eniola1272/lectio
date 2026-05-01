import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { last30Days, type Entry } from "@/lib/stats";
import { SectionTitle } from "@/components/section-title";
import { StatCard } from "@/components/progress/stat-card";
import { ActivityBarChart } from "@/components/charts/activity-bar-chart";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("reading_entries")
    .select("testament, book, chapter, read_at")
    .eq("user_id", user.id)
    .order("read_at", { ascending: false });

  const entries = (data ?? []) as Entry[];
  const activity = last30Days(entries);
  const total30 = activity.reduce((s, d) => s + d.count, 0);
  const activeDays = activity.filter((d) => d.count > 0).length;
  const recent = entries.slice(0, 12);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Last 30 days" value={total30} sub="chapters" />
        <StatCard label="Active days" value={activeDays} sub="of last 30" />
        <StatCard
          label="Daily avg"
          value={(total30 / 30).toFixed(1)}
          sub="chapters / day"
        />
      </div>

      <div
        className="p-8"
        style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
      >
        <SectionTitle eyebrow="Rhythm" title="Last 30 days" />
        <div style={{ marginTop: 24 }}>
          <ActivityBarChart data={activity} />
        </div>
      </div>

      <div>
        <SectionTitle eyebrow="History" title="Recent chapters" />
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
            No chapters logged yet. Press{" "}
            <em>Mark Chapter</em> to begin.
          </div>
        ) : (
          <div className="mt-6">
            {recent.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px dotted #d4be96" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 11,
                      color: "#7a5d3a",
                      minWidth: 80,
                    }}
                  >
                    {new Date(e.read_at + "T12:00:00").toLocaleDateString(
                      "en",
                      { month: "short", day: "numeric" }
                    )}
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
                      color: "#a87132",
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
