import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const like = `%${q}%`;

  const [contacts, applications, linkedin] = await Promise.all([
    supabase.from("contacts").select("id,name,company,status").or(`name.ilike.${like},company.ilike.${like},notes.ilike.${like}`).limit(6),
    supabase.from("applications").select("id,job_title,client_name,status").or(`job_title.ilike.${like},client_name.ilike.${like},notes.ilike.${like}`).limit(6),
    supabase.from("linkedin_activities").select("id,person_name,company,activity_type").or(`person_name.ilike.${like},company.ilike.${like},content.ilike.${like}`).limit(6),
  ]);

  const results = [
    ...(contacts.data ?? []).map((c) => ({ type: "contact" as const, id: c.id, title: c.name, subtitle: c.company, href: `/contacts?highlight=${c.id}` })),
    ...(applications.data ?? []).map((a) => ({ type: "application" as const, id: a.id, title: a.job_title, subtitle: a.client_name, href: `/applications?highlight=${a.id}` })),
    ...(linkedin.data ?? []).map((l) => ({ type: "linkedin" as const, id: l.id, title: l.person_name ?? l.activity_type, subtitle: l.company, href: `/linkedin?highlight=${l.id}` })),
  ];

  return NextResponse.json({ results });
}
