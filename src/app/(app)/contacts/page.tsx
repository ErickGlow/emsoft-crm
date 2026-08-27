import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContactsFilterBar } from "@/components/contacts/ContactsFilterBar";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";
import { Button } from "@/components/ui/Button";
import { IconKanban } from "@/components/icons";
import type { Contact, ContactStatus, PlatformType } from "@/lib/database.types";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("contacts").select("*").order("created_at", { ascending: false });
  if (params.source) query = query.eq("source", params.source as PlatformType);
  if (params.status) query = query.eq("status", params.status as ContactStatus);

  const { data } = await query;
  const contacts = (data ?? []) as Contact[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{contacts.length} total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pipeline"><Button variant="secondary"><IconKanban className="h-4 w-4" /> Pipeline view</Button></Link>
          <QuickActionBar />
        </div>
      </div>
      <ContactsFilterBar />
      <ContactsTable contacts={contacts} />
    </div>
  );
}
