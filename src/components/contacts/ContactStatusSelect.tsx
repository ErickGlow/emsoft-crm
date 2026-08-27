"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/lib/context/ProfileContext";
import { Badge } from "@/components/ui/Badge";
import { CONTACT_STATUS_LABELS } from "@/lib/constants";
import type { ContactStatus } from "@/lib/database.types";

const COLORS: Record<ContactStatus, string> = {
  contacted: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  replied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  in_contact: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  qualified: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  call_scheduled: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  proposal: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function ContactStatusSelect({ id, status }: { id: string; status: ContactStatus }) {
  const isAdmin = useIsAdmin();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  if (!isAdmin) return <Badge className={COLORS[status]}>{CONTACT_STATUS_LABELS[status]}</Badge>;

  async function handleChange(next: ContactStatus) {
    setValue(next);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("contacts").update({ status: next }).eq("id", id);
    setSaving(false);
    if (error) { push(`Couldn't update: ${error.message}`, "error"); return; }
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as ContactStatus)}
      className={`text-[11.5px] font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 ${COLORS[value]}`}
    >
      {Object.entries(CONTACT_STATUS_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}
