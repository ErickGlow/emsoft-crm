"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/lib/context/ProfileContext";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import type { ApplicationStatus } from "@/lib/database.types";

export function StatusSelect({ id, status }: { id: string; status: ApplicationStatus }) {
  const isAdmin = useIsAdmin();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  if (!isAdmin) {
    return <Badge className={APPLICATION_STATUS_COLORS[status]}>{APPLICATION_STATUS_LABELS[status]}</Badge>;
  }

  async function handleChange(next: ApplicationStatus) {
    setValue(next);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("applications").update({ status: next }).eq("id", id);
    setSaving(false);
    if (error) { push(`Couldn't update status: ${error.message}`, "error"); return; }
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
      className={`text-[11.5px] font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 ${APPLICATION_STATUS_COLORS[value]}`}
    >
      {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}
