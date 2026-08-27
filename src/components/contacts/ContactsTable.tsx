import { Card } from "@/components/ui/Card";
import { ContactStatusSelect } from "./ContactStatusSelect";
import { IconExternal } from "@/components/icons";
import { fmtDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/utils";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { Contact } from "@/lib/database.types";

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-[var(--text-muted)]">No contacts yet. Add one when someone becomes worth tracking.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[11.5px] text-[var(--text-faint)] uppercase tracking-wide">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Source</th>
            <th className="px-4 py-2.5 font-medium">Potential Value</th>
            <th className="px-4 py-2.5 font-medium">Next Follow-up</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {contacts.map((c) => (
            <tr key={c.id} className="hover:bg-[var(--bg-subtle)]/60 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium">{c.name}</p>
                {c.company && <p className="text-[11.5px] text-[var(--text-muted)]">{c.company}{c.position ? ` · ${c.position}` : ""}</p>}
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{PLATFORM_LABELS[c.source]}</td>
              <td className="px-4 py-3 tabular-nums">{c.potential_value ? formatCurrency(Number(c.potential_value)) : "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{c.next_followup_date ? fmtDate(c.next_followup_date) : "—"}</td>
              <td className="px-4 py-3"><ContactStatusSelect id={c.id} status={c.status} /></td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-2 justify-end">
                  {c.linkedin_profile_url && (
                    <a href={c.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline">
                      Profile <IconExternal className="h-3 w-3" />
                    </a>
                  )}
                  {c.linkedin_conversation_url && (
                    <a href={c.linkedin_conversation_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline">
                      Chat <IconExternal className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
