import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FriendsView } from "./friends-view";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profileData }, { data: progressData }, { data: historyData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", user.id)
        .single(),
      supabase
        .from("reading_progress")
        .select("chapter_index")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("progress_history")
        .select("chapter_index, recorded_at")
        .eq("user_id", user.id)
        .gte(
          "recorded_at",
          new Date(Date.now() - 30 * 86400000).toISOString()
        )
        .order("recorded_at", { ascending: true }),
    ]);

  return (
    <FriendsView
      userId={user.id}
      myDisplayName={profileData?.display_name ?? "You"}
      myChapterIndex={progressData?.chapter_index ?? 0}
      myHistory={historyData ?? []}
    />
  );
}
