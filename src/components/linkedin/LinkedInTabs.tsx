"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "All" },
  { key: "post", label: "Posts" },
  { key: "comment", label: "Comments" },
  { key: "message", label: "Messages" },
  { key: "followup", label: "Follow-ups" },
];

export function LinkedInTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "all";

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-subtle)] w-fit">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => router.push(t.key === "all" ? pathname : `${pathname}?type=${t.key}`)}
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
