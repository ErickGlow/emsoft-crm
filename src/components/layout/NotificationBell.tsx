"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconBell } from "@/components/icons";

export function NotificationBell({ overdue, dueToday }: { overdue: number; dueToday: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = overdue + dueToday;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
        aria-label="Notifications"
      >
        <IconBell className="h-[17px] w-[17px]" />
        {total > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-[var(--danger)] text-white text-[9.5px] font-bold flex items-center justify-center">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] py-2 z-50 animate-fade-in">
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">Follow-ups</p>
          <Link href="/followups?tab=overdue" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-subtle)] text-[13px]">
            <span className="text-[var(--danger)] font-medium">Overdue</span>
            <span className="font-semibold">{overdue}</span>
          </Link>
          <Link href="/followups?tab=today" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-subtle)] text-[13px]">
            <span className="font-medium">Due today</span>
            <span className="font-semibold">{dueToday}</span>
          </Link>
          {total === 0 && <p className="px-3 py-2 text-[13px] text-[var(--text-muted)]">You&apos;re all caught up.</p>}
        </div>
      )}
    </div>
  );
}
