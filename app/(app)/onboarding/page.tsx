import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If they already have a profile, send them home
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  if (profile) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div
            className="font-mono text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: "#7a5d3a" }}
          >
            One moment
          </div>
          <h1
            className="font-serif italic"
            style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.1, color: "#2c1d0f" }}
          >
            What shall we call you?
          </h1>
        </div>

        <div
          className="p-8"
          style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
        >
          <OnboardingForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
