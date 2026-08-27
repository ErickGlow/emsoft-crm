import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/utils";

export function ConversionSteps({ data }: { data: { stage: string; count: number }[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">Conversion Rates</h3>
      <div className="flex flex-wrap items-center gap-2">
        {data.map((d, i) => {
          const prev = i > 0 ? data[i - 1].count : null;
          const rate = prev && prev > 0 ? d.count / prev : null;
          return (
            <div key={d.stage} className="flex items-center gap-2">
              <div className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-center min-w-[92px]">
                <p className="text-lg font-semibold tabular-nums">{d.count}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{d.stage}</p>
              </div>
              {i < data.length - 1 && (
                <div className="flex flex-col items-center text-[var(--text-faint)]">
                  <span className="text-[11px]">→</span>
                  {rate !== null && <span className="text-[10.5px] font-medium text-[var(--accent)]">{formatPercent(rate)}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
