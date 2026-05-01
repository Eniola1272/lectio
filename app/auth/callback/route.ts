import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
