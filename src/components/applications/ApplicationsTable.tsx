import { Card } from "@/components/ui/Card";
import { StatusSelect } from "./StatusSelect";
import { IconExternal } from "@/components/icons";
import { fmtDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/utils";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { Application } from "@/lib/database.types";

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-[var(--text-muted)]">No applications match these filters yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[11.5px] text-[var(--text-faint)] uppercase tracking-wide">
            <th className="px-4 py-2.5 font-medium">Job</th>
            <th className="px-4 py-2.5 font-medium">Platform</th>
            <th className="px-4 py-2.5 font-medium">Budget</th>
            <th className="px-4 py-2.5 font-medium">Applied</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {applications.map((a) => (
            <tr key={a.id} className="hover:bg-[var(--bg-subtle)]/60 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium truncate max-w-[280px]">{a.job_title}</p>
                {a.client_name && <p className="text-[11.5px] text-[var(--text-muted)]">{a.client_name}</p>}
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{PLATFORM_LABELS[a.platform]}</td>
              <td className="px-4 py-3 tabular-nums">{a.budget ? formatCurrency(Number(a.budget)) : "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{fmtDate(a.applied_at)}</td>
              <td className="px-4 py-3"><StatusSelect id={a.id} status={a.status} /></td>
              <td className="px-4 py-3 text-right">
                {a.job_url && (
                  <a href={a.job_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline">
                    Open <IconExternal className="h-3 w-3" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
