"use client";
import { Button } from "@/components/ui/Button";
import { IconDownload } from "@/components/icons";
import { useIsAdmin } from "@/lib/context/ProfileContext";

export function ExportButton({ type }: { type: "applications" | "contacts" | "activity" }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return (
    <a href={`/api/export?type=${type}`} download>
      <Button variant="secondary" size="sm">
        <IconDownload className="h-3.5 w-3.5" /> Export {type}
      </Button>
    </a>
  );
}
