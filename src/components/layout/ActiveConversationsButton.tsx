"use client";
import { useState, useRef, useEffect } from "react";
import { IconLinkedin, IconExternal } from "@/components/icons";
import { relativeTime } from "@/lib/dates";
import type { ActiveConversation } from "@/lib/data/linkedin-conversations";

export function ActiveConversationsButton({ conversations }: { conversations: ActiveConversation[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = conversations.length;

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
        className="relative flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full bg-[var(--accent)] text-white text-[12.5px] font-semibold shadow-sm hover:bg-[var(--accent-hover)] transition-colors"
      >
        <IconLinkedin className="h-[15px] w-[15px]" />
        <span className="hidden sm:inline">Active Conversations</span>
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/25 text-white text-[11px] font-bold tabular-nums">
          {count}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] py-2 z-50 animate-fade-in max-h-[70vh] overflow-y-auto">
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Active LinkedIn Conversations
          </p>
          {count === 0 && (
            <p className="px-3 py-3 text-[13px] text-[var(--text-muted)]">No active conversations right now.</p>
          )}
          {conversations.map((c) => (
            <a
              key={c.conversationUrl}
              href={c.conversationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[var(--bg-subtle)] group"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{c.personName}</p>
                <p className="text-[11.5px] text-[var(--text-muted)] truncate">
                  {c.company ? `${c.company} · ` : ""}
                  {relativeTime(c.lastActivityAt)}
                </p>
              </div>
              <IconExternal className="h-3.5 w-3.5 shrink-0 text-[var(--text-faint)] group-hover:text-[var(--accent)]" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
