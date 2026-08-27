// Hand-written to match supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is live
// if the schema drifts from this file.

export type UserRole = "admin" | "viewer";
export type PlatformType = "upwork" | "guru" | "freelancer" | "linkedin" | "referral" | "other";
export type ApplicationStatus = "applied" | "followup" | "replied" | "interview" | "proposal" | "won" | "lost";
export type LinkedinActivityType = "post" | "comment" | "message" | "followup";
export type ReplyStatus = "no_reply" | "replied";
export type ContactStatus = "contacted" | "replied" | "in_contact" | "qualified" | "call_scheduled" | "proposal" | "won" | "lost";
export type FollowupOwnerType = "contact" | "application";
export type FollowupStatus = "scheduled" | "completed" | "skipped" | "stopped" | "paused";
export type CallOutcome = "scheduled" | "completed" | "no_show" | "cancelled";
export type ProposalStatus = "sent" | "accepted" | "rejected" | "expired";
export type DealStatus = "open" | "won" | "lost";
export type ActivityKind =
  | "application" | "followup_completed" | "linkedin_post" | "linkedin_comment"
  | "linkedin_message" | "linkedin_followup" | "contact_created" | "contact_replied"
  | "call" | "proposal" | "won";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  timezone: string;
  currency: string;
  theme: string;
  created_at: string;
};

export type FollowupSettings = {
  id: string;
  owner_id: string;
  interval_1_days: number;
  interval_2_days: number;
  interval_3_days: number;
  default_platform: PlatformType;
  updated_at: string;
};

export type Application = {
  id: string;
  owner_id: string;
  platform: PlatformType;
  job_title: string;
  client_name: string | null;
  job_url: string | null;
  budget: number | null;
  applied_at: string;
  status: ApplicationStatus;
  potential_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  owner_id: string;
  name: string;
  company: string | null;
  position: string | null;
  source: PlatformType;
  linkedin_profile_url: string | null;
  linkedin_conversation_url: string | null;
  email: string | null;
  phone: string | null;
  potential_project: string | null;
  potential_value: number | null;
  notes: string | null;
  status: ContactStatus;
  last_contact_date: string | null;
  next_followup_date: string | null;
  created_at: string;
  updated_at: string;
};

export type LinkedinActivity = {
  id: string;
  owner_id: string;
  contact_id: string | null;
  activity_type: LinkedinActivityType;
  person_name: string | null;
  company: string | null;
  profile_url: string | null;
  post_url: string | null;
  conversation_url: string | null;
  comment_url: string | null;
  content: string | null;
  reply_status: ReplyStatus;
  notes: string | null;
  occurred_at: string;
  created_at: string;
};

export type Followup = {
  id: string;
  owner_id: string;
  owner_type: FollowupOwnerType;
  contact_id: string | null;
  application_id: string | null;
  step: number;
  status: FollowupStatus;
  due_date: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
};

export type Call = {
  id: string;
  owner_id: string;
  contact_id: string | null;
  scheduled_at: string;
  outcome: CallOutcome;
  notes: string | null;
  created_at: string;
};

export type Proposal = {
  id: string;
  owner_id: string;
  contact_id: string | null;
  application_id: string | null;
  title: string;
  value: number | null;
  status: ProposalStatus;
  sent_at: string;
  notes: string | null;
  created_at: string;
};

export type Deal = {
  id: string;
  owner_id: string;
  contact_id: string | null;
  application_id: string | null;
  title: string;
  value: number;
  status: DealStatus;
  won_at: string;
  notes: string | null;
  created_at: string;
};

export type ActivityLogEntry = {
  id: string;
  owner_id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  amount: number | null;
  occurred_at: string;
  ref_table: string | null;
  ref_id: string | null;
};

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, Omit<Profile, "created_at">>;
      followup_settings: TableDef<FollowupSettings, Omit<FollowupSettings, "id" | "updated_at">>;
      applications: TableDef<Application, Omit<Application, "id" | "created_at" | "updated_at">>;
      contacts: TableDef<Contact, Omit<Contact, "id" | "created_at" | "updated_at">>;
      linkedin_activities: TableDef<LinkedinActivity, Omit<LinkedinActivity, "id" | "created_at">>;
      followups: TableDef<Followup, Omit<Followup, "id" | "created_at">>;
      calls: TableDef<Call, Omit<Call, "id" | "created_at">>;
      proposals: TableDef<Proposal, Omit<Proposal, "id" | "created_at">>;
      deals: TableDef<Deal, Omit<Deal, "id" | "created_at">>;
      activity_log: TableDef<ActivityLogEntry, Omit<ActivityLogEntry, "id">>;
    };
    Views: Record<string, never>;
    Functions: {
      complete_followup: { Args: { p_followup_id: string; p_notes?: string | null }; Returns: Followup | null };
      skip_followup: { Args: { p_followup_id: string }; Returns: void };
      reschedule_followup: { Args: { p_followup_id: string; p_new_due_date: string }; Returns: void };
      stop_followup_sequence: { Args: { p_followup_id: string }; Returns: void };
      restart_followup_sequence: {
        Args: { p_owner_type: FollowupOwnerType; p_contact_id: string | null; p_application_id: string | null };
        Returns: Followup;
      };
    };
  };
};
