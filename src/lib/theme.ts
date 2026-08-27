"use client";

export type ThemeMode = "light" | "dark" | "system";

export function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("emsoft-theme", mode);
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("emsoft-theme") as ThemeMode) || "system";
}
