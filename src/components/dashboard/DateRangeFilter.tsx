"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const OPTIONS: { key: string; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this_week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "this_month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "today";
  const [showCustom, setShowCustom] = useState(current === "custom");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function select(key: string) {
    if (key === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    router.push(`${pathname}?range=${key}`);
  }

  function applyCustom() {
    if (!from || !to) return;
    router.push(`${pathname}?range=custom&from=${from}&to=${to}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-subtle)]">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => select(o.key)}
            className={cn(
              "h-7 px-3 rounded-md text-[12.5px] font-medium transition-colors",
              current === o.key ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="flex items-center gap-1.5">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[140px] h-7 text-[12.5px]" />
          <span className="text-[var(--text-faint)] text-xs">to</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[140px] h-7 text-[12.5px]" />
          <Button size="sm" variant="primary" onClick={applyCustom}>Apply</Button>
        </div>
      )}
    </div>
  );
}
