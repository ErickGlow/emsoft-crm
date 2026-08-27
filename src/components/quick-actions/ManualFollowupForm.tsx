"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useContactOptions, useApplicationOptions } from "./useContactOptions";
import { format } from "date-fns";

export function ManualFollowupForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const contacts = useContactOptions(open);
  const applications = useApplicationOptions(open);
  const [ownerType, setOwnerType] = useState<"contact" | "application">("contact");
  const [entityId, setEntityId] = useState("");
  const [dueDate, setDueDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entityId) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("followups").insert({
      owner_id: user.id,
      owner_type: ownerType,
      contact_id: ownerType === "contact" ? entityId : null,
      application_id: ownerType === "application" ? entityId : null,
      step: 1,
      status: "scheduled",
      due_date: dueDate,
      notes: notes.trim() || null,
      completed_at: null,
    });

    setSaving(false);
    if (error) { push(`Couldn't schedule follow-up: ${error.message}`, "error"); return; }
    push("Follow-up scheduled");
    setEntityId(""); setNotes("");
    onClose();
    router.refresh();
  }

  const options = ownerType === "contact" ? contacts.map((c) => ({ id: c.id, label: c.name })) : applications.map((a) => ({ id: a.id, label: a.job_title }));

  return (
    <Drawer
      open={open} onClose={onClose} title="Schedule Follow-up"
      footer={<div className="flex gap-2 justify-end"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving || !entityId}>{saving ? "Saving…" : "Schedule"}</Button></div>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>For</Label>
          <Select value={ownerType} onChange={(e) => { setOwnerType(e.target.value as "contact" | "application"); setEntityId(""); }}>
            <option value="contact">A contact / lead</option>
            <option value="application">A freelance application</option>
          </Select>
        </div>
        <div>
          <Label>{ownerType === "contact" ? "Contact" : "Application"}</Label>
          <Select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            <option value="">— Select —</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
        </div>
        <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
        <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </form>
    </Drawer>
  );
}
