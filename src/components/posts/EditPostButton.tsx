"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Textarea, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

// Deliberately NOT gated by useIsAdmin() — either Viacheslav or Evgeniy
// can tweak the wording of a pending post before it's approved, enforced
// server-side by the edit_pending_post() RPC (migration 0007), which
// only ever touches the content column of a still-pending post.
export function EditPostButton({ postId, content }: { postId: string; content: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(content);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    const { error } = await createClient().rpc("edit_pending_post", { p_post_id: postId, p_content: value.trim() });
    setSaving(false);
    if (error) { push(error.message, "error"); return; }
    push("Post updated");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Edit</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Edit post"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !value.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <Label>Post content</Label>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} className="min-h-[260px]" autoFocus />
      </Drawer>
    </>
  );
}
