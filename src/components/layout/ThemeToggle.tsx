"use client";
import { useState } from "react";
import { applyTheme, getStoredTheme, type ThemeMode } from "@/lib/theme";
import { IconSun, IconMoon } from "@/components/icons";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => (typeof window !== "undefined" ? getStoredTheme() : "system"));

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <IconMoon className="h-[17px] w-[17px]" /> : <IconSun className="h-[17px] w-[17px]" />}
    </button>
  );
}
