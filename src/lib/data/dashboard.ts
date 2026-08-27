import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PlatformType } from "@/lib/database.types";

// Business-logic assumptions made where the spec was ambiguous:
//
// - "Replies" (top-level KPI) = LinkedIn activities with reply_status='replied'
//   whose occurred_at falls in the selected range. It does not separately fold
//   in application status changes to avoid double counting against the
//   per-platform breakdown shown elsewhere on the dashboard.
// - "Active Conversations" and "Potential Pipeline Value" are live snapshots
//   of current contact state (not filtered by the date range) — "active"
//   describes a current condition, not something that happened in a window.
// - "Qualified Leads" (range-filtered) approximates "became qualified in this
//   range" via contacts.updated_at, since we don't keep full status history.
//   Good enough for a 2-user internal tool; would need a status-change log
//   table to be exact if that ever matters.
// - Follow-ups completed per platform only count application-linked
//   follow-ups (owner_type='application'); LinkedIn follow-up logs are
//   tracked separately under the LinkedIn breakdown, not double-counted here.

export interface DashboardData {
  applications: { total: number; byPlatform: Record<PlatformType, number> };
  followupsCompleted: { total: number; byPlatform: Record<string, number> };
  linkedin: { posts: number; comments: number; messages: number; followups: number; replies: number };
  replies: number;
  activeConversations: number;
  qualifiedLeads: number;
  calls: number;
  proposals: number;
  wonProjects: number;
  potentialPipelineValue: number;
  wonRevenue: number;
  followupsToday: number;
  followupsOverdue: number;
  followupsUpcoming: number;
}

const emptyPlatformMap = (): Record<PlatformType, number> => ({
  upwork: 0, guru: 0, freelancer: 0, linkedin: 0, referral: 0, direct: 0, other: 0,
});

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  from: Date,
  to: Date
): Promise<DashboardData> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [
    applicationsRes,
    followupsRes,
    linkedinRes,
    contactsSnapshotRes,
    contactsQualifiedRes,
    callsRes,
    proposalsRes,
    dealsRes,
    pipelineRes,
    fuTodayRes,
    fuOverdueRes,
    fuUpcomingRes,
  ] = await Promise.all([
    supabase.from("applications").select("platform").gte("applied_at", fromIso).lte("applied_at", toIso),
    supabase
      .from("followups")
      .select("owner_type, application_id, applications(platform)")
      .eq("status", "completed")
      .gte("completed_at", fromIso)
      .lte("completed_at", toIso),
    supabase
      .from("linkedin_activities")
      .select("activity_type, reply_status")
      .gte("occurred_at", fromIso)
      .lte("occurred_at", toIso),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .in("status", ["in_contact", "qualified", "call_scheduled", "proposal"]),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("status", "qualified")
      .gte("updated_at", fromIso)
      .lte("updated_at", toIso),
    supabase.from("calls").select("id", { count: "exact", head: true }).gte("scheduled_at", fromIso).lte("scheduled_at", toIso),
    supabase.from("proposals").select("id", { count: "exact", head: true }).gte("sent_at", fromIso).lte("sent_at", toIso),
    supabase.from("deals").select("id, value", { count: "exact" }).gte("won_at", fromIso).lte("won_at", toIso),
    supabase.from("contacts").select("potential_value").not("status", "in", "(won,lost)"),
    supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "scheduled").eq("due_date", todayStr),
    supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "scheduled").lt("due_date", todayStr),
    supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "scheduled").gt("due_date", todayStr),
  ]);

  const byPlatform = emptyPlatformMap();
  for (const a of applicationsRes.data ?? []) {
    byPlatform[a.platform as PlatformType] = (byPlatform[a.platform as PlatformType] ?? 0) + 1;
  }

  const followupPlatformMap: Record<string, number> = { upwork: 0, guru: 0, freelancer: 0, other: 0 };
  let followupsTotal = 0;
  for (const f of (followupsRes.data ?? []) as unknown as { owner_type: string; applications: { platform: string } | null }[]) {
    followupsTotal += 1;
    if (f.owner_type === "application" && f.applications?.platform) {
      const p = f.applications.platform;
      followupPlatformMap[p] = (followupPlatformMap[p] ?? 0) + 1;
    }
  }

  let posts = 0, comments = 0, messages = 0, liFollowups = 0, liReplies = 0;
  for (const l of linkedinRes.data ?? []) {
    if (l.activity_type === "post") posts++;
    else if (l.activity_type === "comment") comments++;
    else if (l.activity_type === "message") messages++;
    else if (l.activity_type === "followup") liFollowups++;
    if (l.reply_status === "replied") liReplies++;
  }

  const wonRevenue = (dealsRes.data ?? []).reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const potentialPipelineValue = (pipelineRes.data ?? []).reduce((sum, c) => sum + (Number(c.potential_value) || 0), 0);

  return {
    applications: { total: applicationsRes.data?.length ?? 0, byPlatform },
    followupsCompleted: { total: followupsTotal, byPlatform: followupPlatformMap },
    linkedin: { posts, comments, messages, followups: liFollowups, replies: liReplies },
    replies: liReplies,
    activeConversations: contactsSnapshotRes.count ?? 0,
    qualifiedLeads: contactsQualifiedRes.count ?? 0,
    calls: callsRes.count ?? 0,
    proposals: proposalsRes.count ?? 0,
    wonProjects: dealsRes.count ?? 0,
    potentialPipelineValue,
    wonRevenue,
    followupsToday: fuTodayRes.count ?? 0,
    followupsOverdue: fuOverdueRes.count ?? 0,
    followupsUpcoming: fuUpcomingRes.count ?? 0,
  };
}
