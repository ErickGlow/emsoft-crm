import { createClient } from "@/lib/supabase/server";
import { LinkedInTabs } from "@/components/linkedin/LinkedInTabs";
import { LinkedInList } from "@/components/linkedin/LinkedInList";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";
import type { LinkedinActivity, LinkedinActivityType } from "@/lib/database.types";

export default async function LinkedInPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("linkedin_activities").select("*").order("occurred_at", { ascending: false }).limit(100);
  if (params.type && params.type !== "all") query = query.eq("activity_type", params.type as LinkedinActivityType);

  const { data } = await query;
  const items = (data ?? []) as LinkedinActivity[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">LinkedIn</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{items.length} activities</p>
        </div>
        <QuickActionBar />
      </div>
      <LinkedInTabs />
      <LinkedInList items={items} />
    </div>
  );
}
