import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AttentionMessageForm } from "@/components/messages/AttentionMessageForm";
import { ResolveMessageButton } from "@/components/messages/ResolveMessageButton";
import { fmtDateTime } from "@/lib/dates";
import type { AttentionMessage } from "@/lib/database.types";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("attention_messages").select("*").order("created_at", { ascending: false });
  const all = (data ?? []) as AttentionMessage[];
  const waiting = all.filter((m) => m.status === "waiting");
  const resolved = all.filter((m) => m.status === "resolved");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Messages Awaiting Reply</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            {waiting.length} waiting · only items that need an answer or decision
          </p>
        </div>
        <AttentionMessageForm />
      </div>

      <div>
        <h2 className="text-[13.5px] font-semibold mb-3">Needs attention</h2>
        {waiting.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">Nothing waiting for a reply.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-[var(--border-subtle)]">
            {waiting.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Waiting</Badge>
                    <span className="font-medium text-[13.5px]">
                      {m.person_name}{m.company ? ` · ${m.company}` : ""}
                    </span>
                    <span className="text-[11.5px] text-[var(--text-faint)]">{fmtDateTime(m.created_at)}</span>
                  </div>
                  <p className="text-[13.5px] whitespace-pre-wrap">{m.message_text}</p>
                  {m.notes && <p className="mt-2 text-[12.5px] text-[var(--text-muted)]"><strong>Decision:</strong> {m.notes}</p>}
                  {m.conversation_url && (
                    <a href={m.conversation_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[12.5px] text-[var(--accent)] hover:underline">
                      Open conversation →
                    </a>
                  )}
                </div>
                <div className="shrink-0">
                  <ResolveMessageButton messageId={m.id} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="text-[13.5px] font-semibold mb-3">Handled</h2>
          <Card className="divide-y divide-[var(--border-subtle)]">
            {resolved.slice(0, 20).map((m) => (
              <div key={m.id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Handled</Badge>
                  <span className="text-[13px]">{m.person_name}{m.company ? ` · ${m.company}` : ""}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
