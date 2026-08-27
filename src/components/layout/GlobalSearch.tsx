"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch } from "@/components/icons";

type Result = { type: string; id: string; title: string; subtitle: string | null; href: string };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      const t = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-faint)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search contacts, applications, notes…"
          className="w-full h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] pl-8 pr-3 text-[13px] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:bg-[var(--bg-elevated)]"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] py-1.5 z-50 animate-fade-in">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => {
                setOpen(false);
                setQ("");
                router.push(r.href);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[var(--bg-subtle)] flex flex-col"
            >
              <span className="text-[13px] font-medium">{r.title}</span>
              {r.subtitle && <span className="text-[11.5px] text-[var(--text-muted)]">{r.subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
