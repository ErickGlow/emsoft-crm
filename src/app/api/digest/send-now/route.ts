import { createClient } from "@/lib/supabase/server";
import { sendDailyDigest } from "@/lib/email/digest";
import { NextRequest, NextResponse } from "next/server";

// Manual "send me a test digest right now" trigger — admin only, uses
// the normal authenticated session (not the cron secret). Lets you
// verify email delivery without waiting for tomorrow's scheduled run.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Only admin can send a test digest" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const overrideEmail: string | undefined = body?.email;

  const result = await sendDailyDigest(supabase, overrideEmail);
  return NextResponse.json(result);
}
