-- EMSOFT CRM — initial schema
-- Two-user internal BD tracker. Admin = full read/write. Viewer = read-only.

create extension if not exists "pgcrypto";

-- ==========================================================================
-- ENUMS
-- ==========================================================================
create type user_role as enum ('admin', 'viewer');
create type platform_type as enum ('upwork', 'guru', 'freelancer', 'linkedin', 'referral', 'other');
create type application_status as enum ('applied', 'followup', 'replied', 'interview', 'proposal', 'won', 'lost');
create type linkedin_activity_type as enum ('post', 'comment', 'message', 'followup');
create type reply_status as enum ('no_reply', 'replied');
create type contact_status as enum ('contacted', 'replied', 'in_contact', 'qualified', 'call_scheduled', 'proposal', 'won', 'lost');
create type followup_owner_type as enum ('contact', 'application');
create type followup_status as enum ('scheduled', 'completed', 'skipped', 'stopped', 'paused');
create type call_outcome as enum ('scheduled', 'completed', 'no_show', 'cancelled');
create type proposal_status as enum ('sent', 'accepted', 'rejected', 'expired');
create type deal_status as enum ('open', 'won', 'lost');

-- ==========================================================================
-- PROFILES (mirrors auth.users, adds role)
-- ==========================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'viewer',
  timezone text not null default 'America/Chicago',
  currency text not null default 'USD',
  theme text not null default 'system',
  created_at timestamptz not null default now()
);

-- ==========================================================================
-- FOLLOW-UP SETTINGS (singleton-ish, one row per admin profile)
-- ==========================================================================
create table followup_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade unique,
  interval_1_days int not null default 3,
  interval_2_days int not null default 7,
  interval_3_days int not null default 30,
  default_platform platform_type not null default 'upwork',
  updated_at timestamptz not null default now()
);

-- ==========================================================================
-- APPLICATIONS (Upwork/Guru/Freelancer/Other job applications)
-- ==========================================================================
create table applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  platform platform_type not null,
  job_title text not null,
  client_name text,
  job_url text,
  budget numeric(12,2),
  applied_at timestamptz not null default now(),
  status application_status not null default 'applied',
  potential_value numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_applications_platform on applications(platform);
create index idx_applications_status on applications(status);
create index idx_applications_applied_at on applications(applied_at);

-- ==========================================================================
-- CONTACTS / LEADS
-- ==========================================================================
create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  company text,
  position text,
  source platform_type not null default 'linkedin',
  linkedin_profile_url text,
  linkedin_conversation_url text,
  email text,
  phone text,
  potential_project text,
  potential_value numeric(12,2),
  notes text,
  status contact_status not null default 'contacted',
  last_contact_date timestamptz,
  next_followup_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_contacts_status on contacts(status);
create index idx_contacts_source on contacts(source);
create index idx_contacts_next_followup on contacts(next_followup_date);

-- ==========================================================================
-- LINKEDIN ACTIVITIES (posts / comments / messages / manual followup logs)
-- ==========================================================================
create table linkedin_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  activity_type linkedin_activity_type not null,
  person_name text,
  company text,
  profile_url text,
  post_url text,
  conversation_url text,
  comment_url text,
  content text,
  reply_status reply_status not null default 'no_reply',
  notes text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_linkedin_type on linkedin_activities(activity_type);
create index idx_linkedin_occurred on linkedin_activities(occurred_at);
create index idx_linkedin_contact on linkedin_activities(contact_id);

-- ==========================================================================
-- FOLLOWUPS (belongs to exactly one of contact_id / application_id)
-- ==========================================================================
create table followups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  owner_type followup_owner_type not null,
  contact_id uuid references contacts(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  step int not null default 1 check (step between 1 and 3),
  status followup_status not null default 'scheduled',
  due_date date not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  constraint followup_owner_check check (
    (owner_type = 'contact' and contact_id is not null and application_id is null) or
    (owner_type = 'application' and application_id is not null and contact_id is null)
  )
);
create index idx_followups_due on followups(due_date);
create index idx_followups_status on followups(status);
create index idx_followups_contact on followups(contact_id);
create index idx_followups_application on followups(application_id);

-- ==========================================================================
-- CALLS
-- ==========================================================================
create table calls (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  scheduled_at timestamptz not null,
  outcome call_outcome not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);
create index idx_calls_scheduled on calls(scheduled_at);

-- ==========================================================================
-- PROPOSALS
-- ==========================================================================
create table proposals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  title text not null,
  value numeric(12,2),
  status proposal_status not null default 'sent',
  sent_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);
create index idx_proposals_status on proposals(status);

-- ==========================================================================
-- DEALS (won projects / revenue)
-- ==========================================================================
create table deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  title text not null,
  value numeric(12,2) not null default 0,
  status deal_status not null default 'won',
  won_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);
create index idx_deals_status on deals(status);
create index idx_deals_won_at on deals(won_at);

-- ==========================================================================
-- ACTIVITY LOG (denormalized feed — one row per user-facing event, fast reads)
-- ==========================================================================
create type activity_kind as enum (
  'application', 'followup_completed', 'linkedin_post', 'linkedin_comment',
  'linkedin_message', 'linkedin_followup', 'contact_created', 'contact_replied',
  'call', 'proposal', 'won'
);
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  kind activity_kind not null,
  title text not null,
  subtitle text,
  link_url text,
  amount numeric(12,2),
  occurred_at timestamptz not null default now(),
  ref_table text,
  ref_id uuid
);
create index idx_activity_occurred on activity_log(occurred_at desc);
create index idx_activity_kind on activity_log(kind);

-- ==========================================================================
-- updated_at triggers
-- ==========================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_applications_updated before update on applications
  for each row execute function set_updated_at();
create trigger trg_contacts_updated before update on contacts
  for each row execute function set_updated_at();
