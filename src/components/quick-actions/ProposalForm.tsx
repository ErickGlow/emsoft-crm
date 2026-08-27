"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useContactOptions, useApplicationOptions } from "./useContactOptions";

export function ProposalForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const contacts = useContactOptions(open);
  const applications = useApplicationOptions(open);
  const [contactId, setContactId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("proposals").insert({
      owner_id: user.id,
      contact_id: contactId || null,
      application_id: applicationId || null,
      title: title.trim(),
      value: value ? Number(value) : null,
      status: "sent",
      sent_at: new Date().toISOString(),
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) { push(`Couldn't save proposal: ${error.message}`, "error"); return; }
    push("Proposal logged");
    setTitle(""); setValue(""); setNotes(""); setContactId(""); setApplicationId("");
    onClose();
    router.refresh();
  }

  return (
    <Drawer
      open={open} onClose={onClose} title="Log Proposal"
      footer={<div className="flex gap-2 justify-end"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving || !title.trim()}>{saving ? "Saving…" : "Save"}</Button></div>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label>Proposal title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus /></div>
        <div><Label>Value ($)</Label><Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" /></div>
        <div>
          <Label>Related contact (optional)</Label>
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">—</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div>
          <Label>Related application (optional)</Label>
          <Select value={applicationId} onChange={(e) => setApplicationId(e.target.value)}>
            <option value="">—</option>
            {applications.map((a) => <option key={a.id} value={a.id}>{a.job_title}</option>)}
          </Select>
        </div>
        <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </form>
    </Drawer>
  );
}
