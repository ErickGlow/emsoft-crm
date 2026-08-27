"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/lib/context/ProfileContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fmtDate, isOverdue, isDueToday } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { IconCheck, IconClock, IconX, IconArrowRight } from "@/components/icons";
import type { EnrichedFollowup } from "@/lib/data/followups";

export function FollowupRow({ followup }: { followup: EnrichedFollowup }) {
  const isAdmin = useIsAdmin();
  const [busy, setBusy] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(followup.due_date);
  const { push } = useToast();
  const router = useRouter();

  const overdue = followup.status === "scheduled" && isOverdue(followup.due_date);
  const dueToday = followup.status === "scheduled" && isDueToday(followup.due_date);

  async function run(fn: () => Promise<{ error: { message: string } | null }>, successMsg: string) {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) { push(error.message, "error"); return; }
    push(successMsg);
    router.refresh();
  }

  async function handleComplete() {
    const supabase = createClient();
    await run(async () => {
      const { error } = await supabase.rpc("complete_followup", { p_followup_id: followup.id });
      return { error };
    }, "Follow-up completed — next step scheduled automatically");
  }

  async function handleSkip() {
    const supabase = createClient();
    await run(async () => {
      const { error } = await supabase.rpc("skip_followup", { p_followup_id: followup.id });
      return { error };
    }, "Follow-up skipped");
  }

  async function handleStop() {
    const supabase = createClient();
    await run(async () => {
      const { error } = await supabase.rpc("stop_followup_sequence", { p_followup_id: followup.id });
      return { error };
    }, "Sequence stopped");
  }

  async function handleReschedule() {
    const supabase = createClient();
    await run(async () => {
      const { error } = await supabase.rpc("reschedule_followup", { p_followup_id: followup.id, p_new_due_date: newDate });
      return { error };
    }, "Rescheduled");
    setRescheduling(false);
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded",
              overdue ? "bg-[var(--danger-soft)] text-[var(--danger)]" : dueToday ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"
            )}
          >
            Step {followup.step}
          </span>
          <Link href={followup.entity_link} className="text-[13.5px] font-medium hover:text-[var(--accent)] hover:underline truncate">
            {followup.entity_name}
          </Link>
          <span className="text-[11px] text-[var(--text-faint)] uppercase">{followup.owner_type}</span>
        </div>
        <p className={cn("text-[12px] mt-0.5", overdue ? "text-[var(--danger)] font-medium" : "text-[var(--text-muted)]")}>
          Due {fmtDate(followup.due_date)}
          {overdue && " · Overdue"}
        </p>
      </div>

      {isAdmin && !rescheduling && (
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="primary" onClick={handleComplete} disabled={busy}>
            <IconCheck className="h-3.5 w-3.5" /> Complete
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setRescheduling(true)} disabled={busy}>
            <IconClock className="h-3.5 w-3.5" /> Reschedule
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSkip} disabled={busy}>Skip</Button>
          <Button size="sm" variant="ghost" onClick={handleStop} disabled={busy}>
            <IconX className="h-3.5 w-3.5" /> Stop
          </Button>
        </div>
      )}

      {isAdmin && rescheduling && (
        <div className="flex items-center gap-1.5 shrink-0">
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-[150px] h-8 text-[12.5px]" />
          <Button size="sm" variant="primary" onClick={handleReschedule} disabled={busy}>
            <IconArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRescheduling(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
