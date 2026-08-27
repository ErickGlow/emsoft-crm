"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useContactOptions(open: boolean) {
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("contacts")
      .select("id,name")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setContacts(data ?? []));
  }, [open]);
  return contacts;
}

export function useApplicationOptions(open: boolean) {
  const [applications, setApplications] = useState<{ id: string; job_title: string }[]>([]);
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("applications")
      .select("id,job_title")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setApplications(data ?? []));
  }, [open]);
  return applications;
}
