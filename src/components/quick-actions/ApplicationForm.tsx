"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { PLATFORM_LABELS, APPLICATION_PLATFORMS, APPLICATION_STATUS_LABELS, APPLICATION_CREATE_STATUSES } from "@/lib/constants";
import type { PlatformType, ApplicationStatus } from "@/lib/database.types";
import { format } from "date-fns";

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export function ApplicationForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [platform, setPlatform] = useState<PlatformType>("upwork");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [appliedDate, setAppliedDate] = useState(todayStr());
  const [jobTitle, setJobTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  function reset() {
    setPlatform("upwork"); setStatus("applied"); setAppliedDate(todayStr());
    setJobTitle(""); setClientName(""); setJobUrl(""); setBudget(""); setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // appliedDate is a plain yyyy-MM-dd from the date input — store it at
    // local noon before converting to an ISO timestamp so timezone
    // rounding near midnight can never shift it onto the wrong calendar day.
    const appliedAtIso = new Date(`${appliedDate}T12:00:00`).toISOString();

    const { error } = await supabase.from("applications").insert({
      owner_id: user.id,
      platform,
      job_title: jobTitle.trim(),
      client_name: clientName.trim() || null,
      job_url: jobUrl.trim() || null,
      budget: budget ? Number(budget) : null,
      applied_at: appliedAtIso,
      status,
      potential_value: budget ? Number(budget) : null,
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) {
      push(`Couldn't save application: ${error.message}`, "error");
      return;
    }
    push("Application saved — first follow-up scheduled automatically");
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Application"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving || !jobTitle.trim()}>
            {saving ? "Saving…" : "Save Application"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Platform</Label>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value as PlatformType)}>
            {APPLICATION_PLATFORMS.map((p) => (
              <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Job title</Label>
          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Next.js SaaS Development" autoFocus />
        </div>
        <div>
          <Label>Client / company (optional)</Label>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Inc." />
        </div>
        <div>
          <Label>Job URL (optional)</Label>
          <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://upwork.com/jobs/…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)}>
              {APPLICATION_CREATE_STATUSES.map((s) => (
                <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Applied date</Label>
            <Input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Budget (optional)</Label>
          <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="5000" inputMode="decimal" />
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth remembering…" />
        </div>
        <p className="text-[11.5px] text-[var(--text-faint)]">
          A step-1 follow-up will be scheduled automatically, based on the applied date above and your follow-up
          intervals in Settings.
        </p>
      </form>
    </Drawer>
  );
}
