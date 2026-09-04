"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/lib/context/ProfileContext";

export function DigestTestCard() {
  const isAdmin = useIsAdmin();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { push } = useToast();

  if (!isAdmin) return null;

  async function handleSend() {
    setSending(true);
    const res = await fetch("/api/digest/send-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() || undefined }),
    });
    const result = await res.json();
    setSending(false);

    if (!res.ok || !result.sent) {
      push(result.reason || result.error || "Digest not sent", "error");
      return;
    }
    push(`Test digest sent (${result.pendingCount} pending item(s))`);
  }

  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-1">Daily digest email</h3>
      <p className="text-[12.5px] text-[var(--text-muted)] mb-4">
        Runs automatically once a day (pending posts requiring approval). Send yourself a test copy right now to
        check it&apos;s working, without waiting for the scheduled run.
      </p>
      <div className="flex gap-2 items-end max-w-md">
        <div className="flex-1">
          <Label>Send test to (optional — defaults to configured recipient)</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <Button variant="primary" onClick={handleSend} disabled={sending}>
          {sending ? "Sending…" : "Send Test Digest"}
        </Button>
      </div>
    </Card>
  );
}
