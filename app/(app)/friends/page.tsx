import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FriendsView } from "./friends-view";
import { computeStats, type Entry } from "@/lib/stats";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", user.id)
    .single();

  const { data: entriesData } = await supabase
    .from("reading_entries")
    .select("testament, book, chapter, read_at")
    .eq("user_id", user.id);

  const myEntries = (entriesData ?? []) as Entry[];
  const myStats = computeStats(myEntries);

  return (
    <FriendsView
      userId={user.id}
      myDisplayName={profileData?.display_name ?? "You"}
      myStats={myStats}
      myEntries={myEntries}
    />
  );
}
