import { createClient } from "@/lib/supabase/server";
import { getReportRange, type ReportPeriod } from "@/lib/dates";
import { getDashboardData } from "@/lib/data/dashboard";
import { getConversionFunnel, getSourceComparison } from "@/lib/data/charts";
import { ReportPeriodSwitcher } from "@/components/reports/ReportPeriodSwitcher";
import { ConversionSteps } from "@/components/reports/ConversionSteps";
import { ExportButton } from "@/components/reports/ExportButton";
import { StatGroupCard } from "@/components/dashboard/StatGroupCard";
import { SourceComparisonChart } from "@/components/dashboard/Charts";
import { formatCurrency } from "@/lib/utils";
import { PLATFORM_LABELS } from "@/lib/constants";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as ReportPeriod) || "daily";
  const anchor = params.date ? new Date(params.date) : new Date();
  const range = getReportRange(period, anchor);

  const supabase = await createClient();
  const [data, funnel, sourceComparison] = await Promise.all([
    getDashboardData(supabase, range.from, range.to),
    getConversionFunnel(supabase),
    getSourceComparison(supabase),
  ]);

  const platforms = ["upwork", "guru", "freelancer"] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{range.label}</p>
        </div>
        <div className="flex gap-2">
          <ExportButton type="applications" />
          <ExportButton type="contacts" />
          <ExportButton type="activity" />
        </div>
      </div>

      <ReportPeriodSwitcher period={period} anchor={range.from} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatGroupCard
          title="Applications"
          stats={[
            ...platforms.map((p) => ({ label: PLATFORM_LABELS[p], value: data.applications.byPlatform[p] })),
            { label: "Total", value: data.applications.total },
          ]}
        />
        <StatGroupCard
          title="Follow-ups"
          stats={[
            ...platforms.map((p) => ({ label: PLATFORM_LABELS[p], value: data.followupsCompleted.byPlatform[p] ?? 0 })),
            { label: "Total completed", value: data.followupsCompleted.total },
          ]}
        />
        <StatGroupCard
          title="LinkedIn"
          stats={[
            { label: "Posts", value: data.linkedin.posts },
            { label: "Comments", value: data.linkedin.comments },
            { label: "Messages", value: data.linkedin.messages },
            { label: "Follow-ups", value: data.linkedin.followups },
            { label: "Replies", value: data.linkedin.replies },
          ]}
        />
        <StatGroupCard
          title="Sales"
          stats={[
            { label: "New qualified leads", value: data.qualifiedLeads },
            { label: "Calls", value: data.calls },
            { label: "Proposals", value: data.proposals },
            { label: "Won projects", value: data.wonProjects },
            { label: "Won revenue", value: formatCurrency(data.wonRevenue) },
          ]}
        />
      </div>

      <ConversionSteps data={funnel} />

      <div className="grid lg:grid-cols-2 gap-6">
        <SourceComparisonChart data={sourceComparison} />
        <StatGroupCard
          title="Pipeline Snapshot"
          stats={[
            { label: "Active conversations", value: data.activeConversations },
            { label: "Potential pipeline value", value: formatCurrency(data.potentialPipelineValue) },
          ]}
        />
      </div>
    </div>
  );
}
