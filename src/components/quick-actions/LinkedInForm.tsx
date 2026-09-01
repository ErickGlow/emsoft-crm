"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { LinkedinActivityType } from "@/lib/database.types";

const TYPES: { key: LinkedinActivityType | "daily_count"; label: string }[] = [
  { key: "post", label: "Post" },
  { key: "comment", label: "Comment" },
  { key: "message", label: "Message" },
  { key: "followup", label: "Follow-up" },
  { key: "daily_count", label: "Daily Count" },
];

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export function LinkedInForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<LinkedinActivityType | "daily_count">("comment");
  const [personName, setPersonName] = useState("");
  const [company, setCompany] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [conversationUrl, setConversationUrl] = useState("");
  const [commentUrl, setCommentUrl] = useState("");
  const [content, setContent] = useState("");
  const [replied, setReplied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Daily Count tab state
  const [countDate, setCountDate] = useState(todayStr());
  const [commentsCount, setCommentsCount] = useState("");
  const [messagesCount, setMessagesCount] = useState("");

  const { push } = useToast();
  const router = useRouter();

  function reset() {
    setPersonName(""); setCompany(""); setProfileUrl(""); setPostUrl("");
    setConversationUrl(""); setCommentUrl(""); setContent(""); setReplied(false);
    setCountDate(todayStr()); setCommentsCount(""); setMessagesCount("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (type === "daily_count") {
      const comments = Math.max(0, parseInt(commentsCount, 10) || 0);
      const messages = Math.max(0, parseInt(messagesCount, 10) || 0);
      if (comments === 0 && messages === 0) return;

      setSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const occurredAt = new Date(`${countDate}T12:00:00`).toISOString();
      const rows = [
        ...Array.from({ length: comments }, () => ({
          owner_id: user.id, contact_id: null, activity_type: "comment" as const,
          person_name: null, company: null, profile_url: null, post_url: null,
          conversation_url: null, comment_url: null, content: null,
          reply_status: "no_reply" as const, notes: null, occurred_at: occurredAt,
        })),
        ...Array.from({ length: messages }, () => ({
          owner_id: user.id, contact_id: null, activity_type: "message" as const,
          person_name: null, company: null, profile_url: null, post_url: null,
          conversation_url: null, comment_url: null, content: null,
          reply_status: "no_reply" as const, notes: null, occurred_at: occurredAt,
        })),
      ];

      const { error } = await supabase.from("linkedin_activities").insert(rows);
      setSaving(false);
      if (error) { push(`Couldn't save: ${error.message}`, "error"); return; }
      push(`Logged ${comments} comment(s) and ${messages} message(s) for ${countDate}`);
      reset();
      onClose();
      router.refresh();
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("linkedin_activities").insert({
      owner_id: user.id,
      contact_id: null,
      activity_type: type,
      person_name: personName.trim() || null,
      company: company.trim() || null,
      profile_url: profileUrl.trim() || null,
      post_url: postUrl.trim() || null,
      conversation_url: conversationUrl.trim() || null,
      comment_url: commentUrl.trim() || null,
      content: content.trim() || null,
      reply_status: replied ? "replied" : "no_reply",
      notes: null,
      occurred_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) { push(`Couldn't save: ${error.message}`, "error"); return; }
    push(`LinkedIn ${type} logged`);
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Log LinkedIn Activity"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      }
    >
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-[var(--bg-subtle)] flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={cn(
              "flex-1 h-8 rounded-md text-[11.5px] font-medium transition-colors whitespace-nowrap px-1.5",
              type === t.key ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text)]" : "text-[var(--text-muted)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "daily_count" && (
          <>
            <p className="text-[12px] text-[var(--text-muted)] -mt-1">
              Just log totals for a day — no per-person details or links. These still count correctly in weekly and
              monthly reports, same as individually logged activity.
            </p>
            <div>
              <Label>Date</Label>
              <Input type="date" value={countDate} onChange={(e) => setCountDate(e.target.value)} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Comments</Label>
                <Input type="number" min={0} inputMode="numeric" value={commentsCount} onChange={(e) => setCommentsCount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Direct messages</Label>
                <Input type="number" min={0} inputMode="numeric" value={messagesCount} onChange={(e) => setMessagesCount(e.target.value)} placeholder="0" />
              </div>
            </div>
          </>
        )}

        {type !== "post" && type !== "daily_count" && (
          <>
            <div>
              <Label>Person&apos;s name</Label>
              <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Michael Smith" autoFocus />
            </div>
            <div>
              <Label>Company (optional)</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="SaaS Founder @ Acme" />
            </div>
            <div>
              <Label>LinkedIn profile URL</Label>
              <Input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://linkedin.com/in/…" />
            </div>
          </>
        )}

        {type === "comment" && (
          <>
            <div><Label>Post URL</Label><Input value={postUrl} onChange={(e) => setPostUrl(e.target.value)} /></div>
            <div><Label>Direct comment URL (optional)</Label><Input value={commentUrl} onChange={(e) => setCommentUrl(e.target.value)} /></div>
            <div><Label>Comment text</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} /></div>
          </>
        )}

        {(type === "message" || type === "followup") && (
          <>
            <div><Label>Conversation URL</Label><Input value={conversationUrl} onChange={(e) => setConversationUrl(e.target.value)} /></div>
            <div><Label>Message text / summary</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} /></div>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={replied} onChange={(e) => setReplied(e.target.checked)} className="rounded" />
              They replied
            </label>
          </>
        )}

        {type === "post" && (
          <>
            <div><Label>Post URL</Label><Input value={postUrl} onChange={(e) => setPostUrl(e.target.value)} autoFocus /></div>
            <div><Label>Notes / summary (optional)</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} /></div>
          </>
        )}
      </form>
    </Drawer>
  );
}
