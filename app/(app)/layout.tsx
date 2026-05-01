import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!profile) {
    return <div className="min-h-screen relative z-10">{children}</div>;
  }

  const { data: progressData } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <AppNav userId={user.id} initialProgress={progressData ?? null} />
        {children}
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
