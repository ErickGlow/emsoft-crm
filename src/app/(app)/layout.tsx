import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ToastProvider } from "@/components/ui/Toast";
import { ProfileProvider } from "@/lib/context/ProfileContext";
import { getActiveLinkedInConversations } from "@/lib/data/linkedin-conversations";
import type { Profile } from "@/lib/database.types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold mb-2">No profile found</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Your account is authenticated but has no matching row in <code>profiles</code>. Ask an admin to run the
            seed script, or insert a profile row manually with this user&apos;s id: <code>{user.id}</code>.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const [{ count: overdue }, { count: dueToday }, conversations] = await Promise.all([
    supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "scheduled").lt("due_date", today),
    supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "scheduled").eq("due_date", today),
    getActiveLinkedInConversations(supabase),
  ]);

  return (
    <ProfileProvider profile={profile}>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar profile={profile} overdue={overdue ?? 0} dueToday={dueToday ?? 0} conversations={conversations} />
            <main className="flex-1 px-4 md:px-6 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </ProfileProvider>
  );
}
