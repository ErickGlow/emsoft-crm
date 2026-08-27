"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { FollowupSettings, PlatformType } from "@/lib/database.types";

const TIMEZONES = [
  "America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles",
  "Europe/Moscow", "Europe/London", "Asia/Dubai", "UTC",
];
const CURRENCIES = ["USD", "EUR", "GBP", "AED"];

export function SettingsForm({
  initialSettings, isAdmin, timezone, currency, ownerId,
}: {
  initialSettings: FollowupSettings | null;
  isAdmin: boolean;
  timezone: string;
  currency: string;
  ownerId: string;
}) {
  const [interval1, setInterval1] = useState(initialSettings?.interval_1_days ?? 3);
  const [interval2, setInterval2] = useState(initialSettings?.interval_2_days ?? 7);
  const [interval3, setInterval3] = useState(initialSettings?.interval_3_days ?? 30);
  const [defaultPlatform, setDefaultPlatform] = useState<PlatformType>(initialSettings?.default_platform ?? "upwork");
  const [tz, setTz] = useState(timezone);
  const [cur, setCur] = useState(currency);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function saveFollowupSettings() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("followup_settings").upsert(
      {
        owner_id: ownerId,
        interval_1_days: interval1,
        interval_2_days: interval2,
        interval_3_days: interval3,
        default_platform: defaultPlatform,
      },
      { onConflict: "owner_id" }
    );
    setSaving(false);
    if (error) { push(`Couldn't save: ${error.message}`, "error"); return; }
    push("Follow-up settings saved");
    router.refresh();
  }

  async function saveProfileSettings() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ timezone: tz, currency: cur }).eq("id", ownerId);
    setSaving(false);
    if (error) { push(`Couldn't save: ${error.message}`, "error"); return; }
    push("Profile settings saved");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-5">
        <h3 className="text-[13.5px] font-semibold mb-1">Follow-up intervals</h3>
        <p className="text-[12.5px] text-[var(--text-muted)] mb-4">
          Days between each automatic follow-up step. Step 1 fires this many days after initial contact.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <Label>Follow-up 1 (days)</Label>
            <Input type="number" min={1} value={interval1} disabled={!isAdmin} onChange={(e) => setInterval1(Number(e.target.value))} />
          </div>
          <div>
            <Label>Follow-up 2 (days after)</Label>
            <Input type="number" min={1} value={interval2} disabled={!isAdmin} onChange={(e) => setInterval2(Number(e.target.value))} />
          </div>
          <div>
            <Label>Follow-up 3 (days after)</Label>
            <Input type="number" min={1} value={interval3} disabled={!isAdmin} onChange={(e) => setInterval3(Number(e.target.value))} />
          </div>
        </div>
        <div className="mb-4">
          <Label>Default platform for quick-add</Label>
          <Select value={defaultPlatform} disabled={!isAdmin} onChange={(e) => setDefaultPlatform(e.target.value as PlatformType)} className="max-w-[220px]">
            {(["upwork", "guru", "freelancer", "other"] as const).map((p) => (
              <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
            ))}
          </Select>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={saveFollowupSettings} disabled={saving}>
            {saving ? "Saving…" : "Save follow-up settings"}
          </Button>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-[13.5px] font-semibold mb-4">Workspace defaults</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label>Timezone</Label>
            <Select value={tz} disabled={!isAdmin} onChange={(e) => setTz(e.target.value)}>
              {TIMEZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </Select>
          </div>
          <div>
            <Label>Currency</Label>
            <Select value={cur} disabled={!isAdmin} onChange={(e) => setCur(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={saveProfileSettings} disabled={saving}>
            {saving ? "Saving…" : "Save workspace defaults"}
          </Button>
        )}
      </Card>

      {!isAdmin && (
        <p className="text-[12.5px] text-[var(--text-muted)]">
          You have read-only access. Settings can only be changed by the admin account.
        </p>
      )}
    </div>
  );
}
