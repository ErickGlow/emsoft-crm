"use client";
import { useState } from "react";
import { useIsAdmin } from "@/lib/context/ProfileContext";
import { IconPlus, IconBriefcase, IconLinkedin, IconUsers, IconPhone, IconFileText, IconTrophy, IconClock } from "@/components/icons";
import { ApplicationForm } from "./ApplicationForm";
import { LinkedInForm } from "./LinkedInForm";
import { ContactForm } from "./ContactForm";
import { CallForm } from "./CallForm";
import { ProposalForm } from "./ProposalForm";
import { WonForm } from "./WonForm";
import { ManualFollowupForm } from "./ManualFollowupForm";
import { PostForm } from "./PostForm";

type ActionKey = "application" | "linkedin" | "contact" | "call" | "proposal" | "won" | "followup" | "post" | null;

const actions: { key: Exclude<ActionKey, null>; label: string; icon: typeof IconPlus }[] = [
  { key: "application", label: "Application", icon: IconBriefcase },
  { key: "followup", label: "Follow-up", icon: IconClock },
  { key: "linkedin", label: "LinkedIn", icon: IconLinkedin },
  { key: "post", label: "Post", icon: IconFileText },
  { key: "contact", label: "Contact / Lead", icon: IconUsers },
  { key: "call", label: "Call", icon: IconPhone },
  { key: "proposal", label: "Proposal", icon: IconFileText },
  { key: "won", label: "Won Project", icon: IconTrophy },
];

export function QuickActionBar() {
  const isAdmin = useIsAdmin();
  const [active, setActive] = useState<ActionKey>(null);

  if (!isAdmin) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => setActive(a.key)}
            className="inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[13px] font-medium hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors"
          >
            <IconPlus className="h-3.5 w-3.5" />
            {a.label}
          </button>
        ))}
      </div>

      <ApplicationForm open={active === "application"} onClose={() => setActive(null)} />
      <LinkedInForm open={active === "linkedin"} onClose={() => setActive(null)} />
      <ContactForm open={active === "contact"} onClose={() => setActive(null)} />
      <CallForm open={active === "call"} onClose={() => setActive(null)} />
      <ProposalForm open={active === "proposal"} onClose={() => setActive(null)} />
      <WonForm open={active === "won"} onClose={() => setActive(null)} />
      <ManualFollowupForm open={active === "followup"} onClose={() => setActive(null)} />
      <PostForm open={active === "post"} onClose={() => setActive(null)} />
    </>
  );
}
