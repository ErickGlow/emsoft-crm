"use client";
import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; message: string; variant?: "success" | "error" };
const ToastContext = createContext<{ push: (message: string, variant?: "success" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.variant === "error"
                ? "bg-[var(--danger-soft)] border-[var(--danger)]/20 text-[var(--danger)]"
                : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text)]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
