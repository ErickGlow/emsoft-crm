import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Followup } from "@/lib/database.types";

export interface EnrichedFollowup extends Followup {
  entity_name: string;
  entity_link: string;
}

export async function getFollowupsList(
  supabase: SupabaseClient<Database>,
  tab: "today" | "overdue" | "upcoming" | "all"
): Promise<EnrichedFollowup[]> {
  const todayStr = new Date().toISOString().slice(0, 10);
  let query = supabase.from("followups").select("*").order("due_date", { ascending: true });

  if (tab === "today") query = query.eq("status", "scheduled").eq("due_date", todayStr);
  else if (tab === "overdue") query = query.eq("status", "scheduled").lt("due_date", todayStr);
  else if (tab === "upcoming") query = query.eq("status", "scheduled").gt("due_date", todayStr);
  else query = query.in("status", ["scheduled", "paused"]);

  const { data: followups } = await query;
  if (!followups || followups.length === 0) return [];

  const contactIds = [...new Set(followups.filter((f) => f.contact_id).map((f) => f.contact_id as string))];
  const applicationIds = [...new Set(followups.filter((f) => f.application_id).map((f) => f.application_id as string))];

  const [contactsRes, applicationsRes] = await Promise.all([
    contactIds.length ? supabase.from("contacts").select("id,name").in("id", contactIds) : Promise.resolve({ data: [] }),
    applicationIds.length ? supabase.from("applications").select("id,job_title").in("id", applicationIds) : Promise.resolve({ data: [] }),
  ]);

  const contactMap = new Map((contactsRes.data ?? []).map((c) => [c.id, c.name]));
  const applicationMap = new Map((applicationsRes.data ?? []).map((a) => [a.id, a.job_title]));

  return (followups as Followup[]).map((f) => ({
    ...f,
    entity_name:
      f.owner_type === "contact"
        ? contactMap.get(f.contact_id ?? "") ?? "Unknown contact"
        : applicationMap.get(f.application_id ?? "") ?? "Unknown application",
    entity_link: f.owner_type === "contact" ? `/contacts?highlight=${f.contact_id}` : `/applications?highlight=${f.application_id}`,
  }));
}
