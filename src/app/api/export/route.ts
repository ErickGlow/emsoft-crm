import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "applications";
  const supabase = await createClient();

  const { data: profile } = await supabase.auth.getUser();
  if (!profile.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profileRow } = await supabase.from("profiles").select("role").eq("id", profile.user.id).single();
  if (profileRow?.role !== "admin") {
    return NextResponse.json({ error: "Only admin can export data" }, { status: 403 });
  }

  let rows: Record<string, unknown>[] = [];

  if (type === "applications") {
    const { data } = await supabase.from("applications").select("*").order("applied_at", { ascending: false });
    rows = data ?? [];
  } else if (type === "contacts") {
    const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    rows = data ?? [];
  } else if (type === "activity") {
    const { data } = await supabase.from("activity_log").select("*").order("occurred_at", { ascending: false }).limit(2000);
    rows = data ?? [];
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="emsoft-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
