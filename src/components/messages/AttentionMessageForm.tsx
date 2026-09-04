"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useIsAdmin } from "@/lib/context/ProfileContext";
import { IconPlus } from "@/components/icons";

// Admin-only — matches attention_messages_insert RLS policy. Evgeniy
// (viewer) only ever resolves items here, never creates them.
export function AttentionMessageForm() {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const { push } = useToast();
  const router = useRouter();

  if (!isAdmin) return null;

  function reset() {
    setName(""); setCompany(""); setText(""); setUrl(""); setNotes("");
  }

  async function handleSave() {
    if (!name.trim() || !text.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("attention_messages").insert({
      owner_id: user.id,
      person_name: name.trim(),
      company: company.trim() || null,
      message_text: text.trim(),
      conversation_url: url.trim() || null,
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) { push(error.message, "error"); return; }
    push("Message added to the attention queue");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <IconPlus className="h-3.5 w-3.5" /> Add message
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Message awaiting reply"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim() || !text.trim()}>
              {saving ? "Saving…" : "Add"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div><Label>Person</Label><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
          <div><Label>Company (optional)</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[150px]" /></div>
          <div><Label>Conversation URL (optional)</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} /></div>
          <div><Label>Notes — what needs to be decided (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
      </Drawer>
    </>
  );
}
