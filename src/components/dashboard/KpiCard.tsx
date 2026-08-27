import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label, value, icon: Icon, accent = false,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card className="p-4 flex items-start justify-between hover:shadow-[var(--shadow-md)] transition-shadow">
      <div>
        <p className="text-[12.5px] font-medium text-[var(--text-muted)]">{label}</p>
        <p className={cn("mt-1.5 text-2xl font-semibold tracking-tight tabular-nums", accent && "text-[var(--accent)]")}>{value}</p>
      </div>
      {Icon && (
        <div className="h-8 w-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)]">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </Card>
  );
}
