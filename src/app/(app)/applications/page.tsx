import { createClient } from "@/lib/supabase/server";
import { ApplicationsFilterBar } from "@/components/applications/ApplicationsFilterBar";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";
import type { Application, ApplicationStatus, PlatformType } from "@/lib/database.types";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("applications").select("*").order("applied_at", { ascending: false });
  if (params.platform) query = query.eq("platform", params.platform as PlatformType);
  if (params.status) query = query.eq("status", params.status as ApplicationStatus);

  const { data } = await query;
  const applications = (data ?? []) as Application[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Applications</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{applications.length} total</p>
        </div>
        <QuickActionBar />
      </div>
      <ApplicationsFilterBar />
      <ApplicationsTable applications={applications} />
    </div>
  );
}
