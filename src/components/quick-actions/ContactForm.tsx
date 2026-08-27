"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { PlatformType } from "@/lib/database.types";

export function ContactForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [source, setSource] = useState<PlatformType>("linkedin");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [conversationUrl, setConversationUrl] = useState("");
  const [email, setEmail] = useState("");
  const [potentialProject, setPotentialProject] = useState("");
  const [potentialValue, setPotentialValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  function reset() {
    setName(""); setCompany(""); setPosition(""); setSource("linkedin"); setLinkedinUrl("");
    setConversationUrl(""); setEmail(""); setPotentialProject(""); setPotentialValue(""); setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("contacts").insert({
      owner_id: user.id,
      name: name.trim(),
      company: company.trim() || null,
      position: position.trim() || null,
      source,
      linkedin_profile_url: linkedinUrl.trim() || null,
      linkedin_conversation_url: conversationUrl.trim() || null,
      email: email.trim() || null,
      phone: null,
      potential_project: potentialProject.trim() || null,
      potential_value: potentialValue ? Number(potentialValue) : null,
      notes: notes.trim() || null,
      status: "contacted",
      last_contact_date: new Date().toISOString(),
      next_followup_date: null,
    });

    setSaving(false);
    if (error) { push(`Couldn't save contact: ${error.message}`, "error"); return; }
    push("Contact created");
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Contact / Lead"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving || !name.trim()}>{saving ? "Saving…" : "Save Contact"}</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        <div><Label>Position</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} /></div>
        <div>
          <Label>Source</Label>
          <Select value={source} onChange={(e) => setSource(e.target.value as PlatformType)}>
            {(["linkedin", "upwork", "guru", "freelancer", "referral", "other"] as const).map((s) => (
              <option key={s} value={s}>{PLATFORM_LABELS[s]}</option>
            ))}
          </Select>
        </div>
        <div><Label>LinkedIn profile URL</Label><Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} /></div>
        <div><Label>LinkedIn conversation URL</Label><Input value={conversationUrl} onChange={(e) => setConversationUrl(e.target.value)} /></div>
        <div><Label>Email (optional)</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Potential project</Label><Input value={potentialProject} onChange={(e) => setPotentialProject(e.target.value)} /></div>
        <div><Label>Potential value ($)</Label><Input value={potentialValue} onChange={(e) => setPotentialValue(e.target.value)} inputMode="decimal" /></div>
        <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </form>
    </Drawer>
  );
}
