"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";

// Deliberately NOT gated by useIsAdmin() — approving a post is the one
// action both Viacheslav and Evgeniy can take, enforced server-side by
// the approve_post() RPC (see migration 0006), not by role in the UI.
export function ApproveButton({ postId }: { postId: string }) {
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function handleApprove() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("approve_post", { p_post_id: postId });
    setSaving(false);
    if (error) {
      push(`Couldn't approve: ${error.message}`, "error");
      return;
    }
    push("Post approved");
    router.refresh();
  }

  return (
    <Button size="sm" variant="primary" onClick={handleApprove} disabled={saving}>
      <IconCheck className="h-3.5 w-3.5" /> {saving ? "Approving…" : "Approve"}
    </Button>
  );
}
