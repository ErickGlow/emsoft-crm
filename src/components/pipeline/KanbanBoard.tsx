"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/lib/context/ProfileContext";
import { PIPELINE_STAGES, CONTACT_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { Contact, ContactStatus } from "@/lib/database.types";

export function KanbanBoard({ contacts }: { contacts: Contact[] }) {
  const isAdmin = useIsAdmin();
  const [items, setItems] = useState(contacts);
  const [dragOverStage, setDragOverStage] = useState<ContactStatus | null>(null);
  const { push } = useToast();
  const router = useRouter();

  async function moveContact(id: string, status: ContactStatus) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    const supabase = createClient();
    const { error } = await supabase.from("contacts").update({ status }).eq("id", id);
    if (error) {
      push(`Couldn't move contact: ${error.message}`, "error");
      setItems(contacts);
      return;
    }
    push(`Moved to ${CONTACT_STATUS_LABELS[status]}`);
    router.refresh();
  }

  function onDrop(e: React.DragEvent, stage: ContactStatus) {
    e.preventDefault();
    setDragOverStage(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id || !isAdmin) return;
    moveContact(id, stage);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {PIPELINE_STAGES.map((stage) => {
        const stageItems = items.filter((c) => c.status === stage);
        return (
          <div
            key={stage}
            onDragOver={(e) => { e.preventDefault(); if (isAdmin) setDragOverStage(stage); }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => onDrop(e, stage)}
            className={cn(
              "w-[260px] shrink-0 rounded-xl border p-2.5 transition-colors",
              dragOverStage === stage ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg-subtle)]"
            )}
          >
            <div className="flex items-center justify-between px-1.5 py-1 mb-2">
              <h3 className="text-[12.5px] font-semibold">{CONTACT_STATUS_LABELS[stage]}</h3>
              <span className="text-[11px] text-[var(--text-faint)] font-medium">{stageItems.length}</span>
            </div>
            <div className="space-y-2 min-h-[60px]">
              {stageItems.map((c) => (
                <Link
                  key={c.id}
                  href={`/contacts?highlight=${c.id}`}
                  draggable={isAdmin}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                  className={cn(
                    "block rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow",
                    isAdmin && "cursor-grab active:cursor-grabbing"
                  )}
                >
                  <p className="text-[13px] font-medium truncate">{c.name}</p>
                  {c.company && <p className="text-[11.5px] text-[var(--text-muted)] truncate">{c.company}</p>}
                  {c.potential_value != null && (
                    <p className="text-[11.5px] font-medium text-[var(--accent)] mt-1">{formatCurrency(Number(c.potential_value))}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
