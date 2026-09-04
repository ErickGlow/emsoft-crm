"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { IconCheck } from "@/components/icons";

// Deliberately NOT gated by useIsAdmin() — resolving a message is one of
// the two actions both Viacheslav and Evgeniy can take, enforced
// server-side by the resolve_attention_message() RPC (migration 0007).
export function ResolveMessageButton({ messageId }: { messageId: string }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function handleResolve() {
    setSaving(true);
    const { error } = await createClient().rpc("resolve_attention_message", { p_message_id: messageId });
    setSaving(false);
    if (error) { push(error.message, "error"); return; }
    push("Marked as handled");
    router.refresh();
  }

  return (
    <Button size="sm" variant="primary" onClick={handleResolve} disabled={saving}>
      <IconCheck className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Mark handled"}
    </Button>
  );
}
