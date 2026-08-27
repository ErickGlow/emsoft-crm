import { createClient } from "@/lib/supabase/server";
import { getDateRange, type DateRangeKey } from "@/lib/dates";
import { getDashboardData } from "@/lib/data/dashboard";
import { getActivityOverTime, getConversionFunnel, getSourceComparison } from "@/lib/data/charts";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PlatformBreakdown } from "@/components/dashboard/PlatformBreakdown";
import { FollowupsSummary } from "@/components/dashboard/FollowupsSummary";
import { StatGroupCard } from "@/components/dashboard/StatGroupCard";
import { ActivityOverTimeChart, SourceComparisonChart, ConversionFunnelChart } from "@/components/dashboard/Charts";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";
import { formatCurrency } from "@/lib/utils";
import {
  IconBriefcase, IconClock, IconLinkedin, IconMessage, IconUsers, IconPhone, IconFileText, IconTrophy,
} from "@/components/icons";
import type { ActivityLogEntry } from "@/lib/database.types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const rangeKey = (params.range as DateRangeKey) || "today";
  const custom =
    rangeKey === "custom" && params.from && params.to
      ? { from: new Date(params.from), to: new Date(params.to) }
      : undefined;
  const range = getDateRange(rangeKey, custom);

  const supabase = await createClient();

  const [data, activityOverTime, funnel, sourceComparison, recentActivity] = await Promise.all([
    getDashboardData(supabase, range.from, range.to),
    getActivityOverTime(supabase, 14),
    getConversionFunnel(supabase),
    getSourceComparison(supabase),
    supabase
      .from("activity_log")
      .select("*")
      .gte("occurred_at", range.from.toISOString())
      .lte("occurred_at", range.to.toISOString())
      .order("occurred_at", { ascending: false })
      .limit(20),
  ]);

  const activityItems = (recentActivity.data ?? []) as ActivityLogEntry[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Showing {range.label.toLowerCase()}</p>
        </div>
        <DateRangeFilter />
      </div>

      <QuickActionBar />

      <FollowupsSummary today={data.followupsToday} overdue={data.followupsOverdue} upcoming={data.followupsUpcoming} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Applications" value={data.applications.total} icon={IconBriefcase} />
        <KpiCard label="Follow-ups" value={data.followupsCompleted.total} icon={IconClock} />
        <KpiCard label="LinkedIn Comments" value={data.linkedin.comments} icon={IconLinkedin} />
        <KpiCard label="LinkedIn Messages" value={data.linkedin.messages} icon={IconMessage} />
        <KpiCard label="LinkedIn Posts" value={data.linkedin.posts} icon={IconLinkedin} />
        <KpiCard label="Replies" value={data.replies} icon={IconMessage} />
        <KpiCard label="Active Conversations" value={data.activeConversations} icon={IconUsers} />
        <KpiCard label="Qualified Leads" value={data.qualifiedLeads} icon={IconUsers} />
        <KpiCard label="Calls / Meetings" value={data.calls} icon={IconPhone} />
        <KpiCard label="Proposals" value={data.proposals} icon={IconFileText} />
        <KpiCard label="Won Projects" value={data.wonProjects} icon={IconTrophy} accent />
        <KpiCard label="Pipeline Value" value={formatCurrency(data.potentialPipelineValue)} accent />
      </div>

      <PlatformBreakdown applications={data.applications.byPlatform} followups={data.followupsCompleted.byPlatform} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityOverTimeChart data={activityOverTime} />
        </div>
        <StatGroupCard
          title="LinkedIn Snapshot"
          stats={[
            { label: "Posts", value: data.linkedin.posts },
            { label: "Comments", value: data.linkedin.comments },
            { label: "Messages", value: data.linkedin.messages },
            { label: "Follow-ups", value: data.linkedin.followups },
            { label: "Replies", value: data.linkedin.replies },
          ]}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ConversionFunnelChart data={funnel} />
        <SourceComparisonChart data={sourceComparison} />
      </div>

      <div>
        <h2 className="text-[15px] font-semibold mb-3">Activity Feed</h2>
        <ActivityFeed items={activityItems} />
      </div>
    </div>
  );
}
