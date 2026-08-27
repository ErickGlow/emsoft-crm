import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function FollowupsSummary({ today, overdue, upcoming }: { today: number; overdue: number; upcoming: number }) {
  const items = [
    { key: "today", label: "Follow-ups Today", value: today, tone: "text-[var(--text)]" },
    { key: "overdue", label: "Overdue", value: overdue, tone: overdue > 0 ? "text-[var(--danger)]" : "text-[var(--text)]" },
    { key: "upcoming", label: "Upcoming", value: upcoming, tone: "text-[var(--text)]" },
  ];
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">Follow-up Engine</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <Link
            key={it.key}
            href={`/followups?tab=${it.key}`}
            className="rounded-xl border border-[var(--border-subtle)] p-3.5 hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] transition-colors group"
          >
            <p className="text-[11.5px] font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)]">{it.label}</p>
            <p className={cn("text-2xl font-semibold mt-1 tabular-nums", it.tone)}>{it.value}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
