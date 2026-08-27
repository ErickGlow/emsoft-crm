"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "today", label: "Today" },
  { key: "overdue", label: "Overdue" },
  { key: "upcoming", label: "Upcoming" },
  { key: "all", label: "All Active" },
];

export function FollowupTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") ?? "today";

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-subtle)] w-fit">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => router.push(`${pathname}?tab=${t.key}`)}
          className={cn(
            "h-8 px-3.5 rounded-md text-[12.5px] font-medium transition-colors",
            current === t.key ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
