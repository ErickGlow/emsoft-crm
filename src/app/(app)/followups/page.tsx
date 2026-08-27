import { createClient } from "@/lib/supabase/server";
import { getFollowupsList } from "@/lib/data/followups";
import { FollowupTabs } from "@/components/followups/FollowupTabs";
import { FollowupRow } from "@/components/followups/FollowupRow";
import { Card } from "@/components/ui/Card";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";

export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = (params.tab as "today" | "overdue" | "upcoming" | "all") || "today";
  const supabase = await createClient();
  const followups = await getFollowupsList(supabase, tab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Follow-ups</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{followups.length} in this view</p>
        </div>
        <QuickActionBar />
      </div>
      <FollowupTabs />
      {followups.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">Nothing here. You&apos;re all caught up.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-[var(--border-subtle)]">
          {followups.map((f) => (
            <FollowupRow key={f.id} followup={f} />
          ))}
        </Card>
      )}
    </div>
  );
}
