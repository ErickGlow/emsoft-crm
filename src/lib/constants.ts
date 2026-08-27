import type { PlatformType, ApplicationStatus, ContactStatus, ActivityKind } from "@/lib/database.types";

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  upwork: "Upwork",
  guru: "Guru",
  freelancer: "Freelancer",
  linkedin: "LinkedIn",
  referral: "Referral",
  other: "Other",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  followup: "Follow-up",
  replied: "Replied",
  interview: "Interview / Call",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  followup: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  replied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  interview: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  proposal: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  contacted: "Contacted",
  replied: "Replied",
  in_contact: "In Contact",
  qualified: "Qualified",
  call_scheduled: "Call Scheduled",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const PIPELINE_STAGES: ContactStatus[] = [
  "contacted", "replied", "in_contact", "qualified", "call_scheduled", "proposal", "won", "lost",
];

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  application: "Application",
  followup_completed: "Follow-up",
  linkedin_post: "LinkedIn Post",
  linkedin_comment: "LinkedIn Comment",
  linkedin_message: "LinkedIn Message",
  linkedin_followup: "LinkedIn Follow-up",
  contact_created: "New Lead",
  contact_replied: "Reply",
  call: "Call",
  proposal: "Proposal",
  won: "Won Project",
};

export const DEFAULT_TIMEZONE = "America/Chicago";
export const DEFAULT_CURRENCY = "USD";
