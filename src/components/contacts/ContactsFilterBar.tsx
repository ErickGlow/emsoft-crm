"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Input";
import { PLATFORM_LABELS, CONTACT_STATUS_LABELS } from "@/lib/constants";

export function ContactsFilterBar() {
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
      <Select className="w-auto h-8 text-[12.5px]" value={searchParams.get("source") ?? ""} onChange={(e) => update("source", e.target.value)}>
        <option value="">All sources</option>
        {Object.entries(PLATFORM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
      <Select className="w-auto h-8 text-[12.5px]" value={searchParams.get("status") ?? ""} onChange={(e) => update("status", e.target.value)}>
        <option value="">All statuses</option>
        {Object.entries(CONTACT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
    </div>
  );
}
