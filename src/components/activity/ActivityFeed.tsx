import { Card } from "@/components/ui/Card";
import { fmtTime, fmtDateTime } from "@/lib/dates";
import { ACTIVITY_KIND_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { IconExternal } from "@/components/icons";
import type { ActivityLogEntry } from "@/lib/database.types";

export function ActivityFeed({ items, showDate = false }: { items: ActivityLogEntry[]; showDate?: boolean }) {
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">No activity yet. Log your first application, comment, or message to see it here.</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-[var(--border-subtle)]">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
          <div className="w-16 shrink-0 pt-0.5 text-[11.5px] text-[var(--text-faint)] tabular-nums">
            {showDate ? fmtDateTime(item.occurred_at) : fmtTime(item.occurred_at)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded">
                {ACTIVITY_KIND_LABELS[item.kind]}
              </span>
              <span className="text-[13.5px] font-medium truncate">{item.title}</span>
              {item.amount != null && (
                <span className="text-[12px] text-[var(--text-muted)]">{formatCurrency(Number(item.amount))}</span>
              )}
            </div>
            {item.subtitle && <p className="text-[12.5px] text-[var(--text-muted)] mt-0.5">{item.subtitle}</p>}
          </div>
          {item.link_url && (
            <a
              href={item.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline pt-0.5"
            >
              Open <IconExternal className="h-3 w-3" />
            </a>
          )}
        </div>
      ))}
    </Card>
  );
}
