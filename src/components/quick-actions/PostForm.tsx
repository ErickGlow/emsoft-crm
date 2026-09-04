"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export function PostForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("posts")
      .insert({ owner_id: user.id, content: content.trim() });

    if (error) {
      setSaving(false);
      push(`Couldn't save post: ${error.message}`, "error");
      return;
    }

    setSaving(false);
    push("Post saved — will appear in tomorrow's daily digest until approved");
    setContent("");
    onClose();
    router.refresh();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Post"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving || !content.trim()}>
            {saving ? "Saving…" : "Save Post"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Post content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the post here…"
            className="min-h-[220px]"
            autoFocus
          />
        </div>
        <p className="text-[11.5px] text-[var(--text-faint)]">
          Pending posts appear in the daily email digest until approved.
        </p>
      </form>
    </Drawer>
  );
}
