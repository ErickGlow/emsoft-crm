import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";
import { Button } from "@/components/ui/Button";
import { IconUsers } from "@/components/icons";
import type { Contact } from "@/lib/database.types";

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
  const contacts = (data ?? []) as Contact[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Drag a card to move it between stages</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts"><Button variant="secondary"><IconUsers className="h-4 w-4" /> Table view</Button></Link>
          <QuickActionBar />
        </div>
      </div>
      <KanbanBoard contacts={contacts} />
    </div>
  );
}
