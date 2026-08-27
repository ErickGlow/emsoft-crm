"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Input";
import { PLATFORM_LABELS, APPLICATION_STATUS_LABELS } from "@/lib/constants";

export function ApplicationsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        className="w-auto h-8 text-[12.5px]"
        value={searchParams.get("platform") ?? ""}
        onChange={(e) => update("platform", e.target.value)}
      >
        <option value="">All platforms</option>
        {(["upwork", "guru", "freelancer", "other"] as const).map((p) => (
          <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
        ))}
      </Select>
      <Select
        className="w-auto h-8 text-[12.5px]"
        value={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">All statuses</option>
        {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>
    </div>
  );
}
