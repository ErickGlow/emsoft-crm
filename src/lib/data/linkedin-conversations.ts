import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface ActiveConversation {
  conversationUrl: string;
  personName: string;
  company: string | null;
  lastActivityAt: string;
  contactId: string | null;
}

// A "conversation" is identified by its LinkedIn conversation_url. We take
// the most recent message/follow-up activity on that URL as its state. If
// the conversation is linked to a Contact whose pipeline status is 'won'
// or 'lost', it's considered closed and excluded — otherwise every
// conversation with at least one message/follow-up logged counts as active.
export async function getActiveLinkedInConversations(
  supabase: SupabaseClient<Database>
): Promise<ActiveConversation[]> {
  const { data } = await supabase
    .from("linkedin_activities")
    .select("conversation_url, person_name, company, contact_id, occurred_at")
    .in("activity_type", ["message", "followup"])
    .not("conversation_url", "is", null)
    .order("occurred_at", { ascending: false });

  if (!data || data.length === 0) return [];

  // Dedupe by conversation_url, keeping the most recent row (list is
  // already ordered newest-first).
  const byUrl = new Map<string, (typeof data)[number]>();
  for (const row of data) {
    const url = row.conversation_url as string;
    if (!byUrl.has(url)) byUrl.set(url, row);
  }

  const contactIds = [...byUrl.values()].map((r) => r.contact_id).filter((id): id is string => !!id);
  const uniqueContactIds = [...new Set(contactIds)];

  let closedContactIds = new Set<string>();
  if (uniqueContactIds.length > 0) {
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, status")
      .in("id", uniqueContactIds)
      .in("status", ["won", "lost"]);
    closedContactIds = new Set((contacts ?? []).map((c) => c.id));
  }

  return [...byUrl.values()]
    .filter((row) => !row.contact_id || !closedContactIds.has(row.contact_id))
    .map((row) => ({
      conversationUrl: row.conversation_url as string,
      personName: row.person_name ?? "Unknown",
      company: row.company,
      lastActivityAt: row.occurred_at,
      contactId: row.contact_id,
    }));
}
