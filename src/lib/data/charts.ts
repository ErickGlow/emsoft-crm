import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { format, subDays, startOfDay } from "date-fns";

export async function getActivityOverTime(supabase: SupabaseClient<Database>, days: number) {
  const since = startOfDay(subDays(new Date(), days - 1));
  const { data } = await supabase
    .from("activity_log")
    .select("occurred_at")
    .gte("occurred_at", since.toISOString());

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    buckets.set(format(subDays(new Date(), days - 1 - i), "MMM d"), 0);
  }
  for (const row of data ?? []) {
    const key = format(new Date(row.occurred_at), "MMM d");
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets, ([date, count]) => ({ date, count }));
}

export async function getConversionFunnel(supabase: SupabaseClient<Database>) {
  const [applications, replied, calls, proposals, won] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("status", ["replied", "interview", "proposal", "won"]),
    supabase.from("calls").select("id", { count: "exact", head: true }),
    supabase.from("proposals").select("id", { count: "exact", head: true }),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("status", "won"),
  ]);

  return [
    { stage: "Applications", count: applications.count ?? 0 },
    { stage: "Replies", count: replied.count ?? 0 },
    { stage: "Calls", count: calls.count ?? 0 },
    { stage: "Proposals", count: proposals.count ?? 0 },
    { stage: "Won", count: won.count ?? 0 },
  ];
}

export async function getSourceComparison(supabase: SupabaseClient<Database>) {
  const platforms = ["upwork", "guru", "freelancer"] as const;
  const results: { source: string; applications: number; replies: number; won: number }[] = await Promise.all(
    platforms.map(async (platform) => {
      const [applications, replies, won] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("platform", platform),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("platform", platform).in("status", ["replied", "interview", "proposal", "won"]),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("platform", platform).eq("status", "won"),
      ]);
      return { source: platform, applications: applications.count ?? 0, replies: replies.count ?? 0, won: won.count ?? 0 };
    })
  );

  const [liMessages, liReplies, liWon] = await Promise.all([
    supabase.from("linkedin_activities").select("id", { count: "exact", head: true }).eq("activity_type", "message"),
    supabase.from("linkedin_activities").select("id", { count: "exact", head: true }).eq("reply_status", "replied"),
    supabase.from("deals").select("id", { count: "exact", head: true }),
  ]);
  results.push({ source: "linkedin", applications: liMessages.count ?? 0, replies: liReplies.count ?? 0, won: liWon.count ?? 0 });

  return results;
}
