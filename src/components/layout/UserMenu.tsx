"use client";
import { useState, useRef, useEffect } from "react";
import { initials } from "@/lib/utils";
import { IconLogout, IconChevronDown } from "@/components/icons";
import type { Profile } from "@/lib/database.types";

export function UserMenu({ profile, onSignOut }: { profile: Profile; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg px-1.5 h-9 hover:bg-[var(--bg-subtle)]">
        <span className="h-7 w-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[11px] font-semibold">
          {initials(profile.full_name)}
        </span>
        <span className="hidden lg:flex flex-col items-start leading-tight">
          <span className="text-[13px] font-medium">{profile.full_name}</span>
          <span className="text-[11px] text-[var(--text-faint)] capitalize">{profile.role}</span>
        </span>
        <IconChevronDown className="h-3.5 w-3.5 text-[var(--text-faint)]" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] py-1.5 z-50 animate-fade-in">
          <form action={onSignOut}>
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--text)] hover:bg-[var(--bg-subtle)]">
              <IconLogout className="h-4 w-4" /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
