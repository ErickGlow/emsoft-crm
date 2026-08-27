"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/nav";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="space-y-5">
      {NAV_SECTIONS.map((section, i) => (
        <div key={i}>
          {section.group && (
            <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              {section.group}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                  )}
                >
                  <Icon className="h-[17px] w-[17px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-[var(--border)] shrink-0">
        <div className="h-6 w-6 rounded-md bg-[var(--accent)] text-white flex items-center justify-center text-[11px] font-bold">
          E
        </div>
        <span className="font-semibold text-[14px] tracking-tight">EMSOFT CRM</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </nav>
    </aside>
  );
}
