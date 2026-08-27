"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { shiftAnchor, type ReportPeriod } from "@/lib/dates";
import { IconArrowRight } from "@/components/icons";

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export function ReportPeriodSwitcher({ period, anchor }: { period: ReportPeriod; anchor: Date }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(nextPeriod: ReportPeriod, nextAnchor: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", nextPeriod);
    params.set("date", format(nextAnchor, "yyyy-MM-dd"));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-subtle)]">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => go(p.key, anchor)}
            className={cn(
              "h-8 px-3.5 rounded-md text-[12.5px] font-medium transition-colors",
              period === p.key ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(period, shiftAnchor(period, anchor, -1))}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-subtle)]"
          aria-label="Previous period"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <button
          onClick={() => go(period, shiftAnchor(period, anchor, 1))}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-subtle)]"
          aria-label="Next period"
        >
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
