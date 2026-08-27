"use client";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { NavLinks } from "./Sidebar";

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-[18px] w-[18px]">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="EMSOFT CRM">
        <NavLinks onNavigate={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
