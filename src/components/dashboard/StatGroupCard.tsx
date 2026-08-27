import { Card } from "@/components/ui/Card";

export function StatGroupCard({ title, stats }: { title: string; stats: { label: string; value: string | number }[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">{title}</h3>
      <div className="space-y-2.5">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--text-muted)]">{s.label}</span>
            <span className="text-[13px] font-semibold tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
