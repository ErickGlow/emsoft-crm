import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendDailyDigest } from "@/lib/email/digest";
import type { Database } from "@/lib/database.types";

// Called once a day by Vercel Cron (see vercel.json). Protected by
// CRON_SECRET so it can't be triggered by anyone who just guesses the
// URL — only requests carrying the secret (which Vercel's cron
// infrastructure sends automatically) are allowed through.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cron runs have no user session, so this uses the service role key
  // (server-only, never exposed to the browser) to read pending posts —
  // RLS still applies to every other access path in the app.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const result = await sendDailyDigest(supabase);
  return NextResponse.json(result);
}
