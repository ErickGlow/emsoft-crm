import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { FollowupSettings, Profile } from "@/lib/database.types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single<Profile>();

  const { data: adminProfile } = await supabase.from("profiles").select("id").eq("role", "admin").single();
  const { data: settings } = await supabase
    .from("followup_settings")
    .select("*")
    .eq("owner_id", adminProfile?.id ?? user!.id)
    .maybeSingle<FollowupSettings>();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Follow-up cadence, defaults, and workspace preferences</p>
      </div>
      <SettingsForm
        initialSettings={settings}
        isAdmin={profile?.role === "admin"}
        timezone={profile?.timezone ?? "America/Chicago"}
        currency={profile?.currency ?? "USD"}
        ownerId={adminProfile?.id ?? user!.id}
      />
    </div>
  );
}
