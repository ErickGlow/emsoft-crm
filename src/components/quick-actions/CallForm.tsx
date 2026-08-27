"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useContactOptions } from "./useContactOptions";
import type { CallOutcome } from "@/lib/database.types";

export function CallForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const contacts = useContactOptions(open);
  const [contactId, setContactId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [outcome, setOutcome] = useState<CallOutcome>("scheduled");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("calls").insert({
      owner_id: user.id,
      contact_id: contactId || null,
      scheduled_at: new Date(scheduledAt).toISOString(),
      outcome,
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) { push(`Couldn't save call: ${error.message}`, "error"); return; }
    push("Call logged");
    setContactId(""); setNotes(""); setOutcome("scheduled");
    onClose();
    router.refresh();
  }

  return (
    <Drawer
      open={open} onClose={onClose} title="Log Call / Meeting"
      footer={<div className="flex gap-2 justify-end"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Contact</Label>
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">— Select a contact —</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div><Label>Date &amp; time</Label><Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></div>
        <div>
          <Label>Outcome</Label>
          <Select value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome)}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="no_show">No-show</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </form>
    </Drawer>
  );
}
