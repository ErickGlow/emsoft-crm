import { Card } from "@/components/ui/Card";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { PlatformType } from "@/lib/database.types";

export function PlatformBreakdown({
  applications, followups,
}: {
  applications: Record<PlatformType, number>;
  followups: Record<string, number>;
}) {
  const platforms: PlatformType[] = ["upwork", "guru", "freelancer", "other"];
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">Applications by Platform</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {platforms.map((p) => (
          <div key={p} className="rounded-xl border border-[var(--border-subtle)] p-3.5">
            <p className="text-[12px] font-medium text-[var(--text-muted)] mb-2">{PLATFORM_LABELS[p]}</p>
            <p className="text-xl font-semibold tabular-nums">{applications[p] ?? 0}</p>
            <p className="text-[11.5px] text-[var(--text-faint)] mt-0.5">{followups[p] ?? 0} follow-ups</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
