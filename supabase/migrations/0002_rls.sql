-- EMSOFT CRM — Row Level Security
-- Admin: full read/write. Viewer: read-only. Enforced at the DB layer —
-- frontend role checks are UX only and are never the real gate.

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

create or replace function is_authenticated_profile() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid());
$$ language sql stable security definer;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_all" on profiles
  for select using (is_authenticated_profile());

create policy "profiles_update_self_admin_only" on profiles
  for update using (auth.uid() = id and is_admin())
  with check (auth.uid() = id and is_admin());

-- ---------------------------------------------------------------------
-- Generic pattern applied to every business table:
--   SELECT: any authenticated profile (admin or viewer)
--   INSERT/UPDATE/DELETE: admin only
-- ---------------------------------------------------------------------

-- followup_settings
alter table followup_settings enable row level security;
create policy "followup_settings_select" on followup_settings for select using (is_authenticated_profile());
create policy "followup_settings_insert" on followup_settings for insert with check (is_admin());
create policy "followup_settings_update" on followup_settings for update using (is_admin()) with check (is_admin());
create policy "followup_settings_delete" on followup_settings for delete using (is_admin());

-- applications
alter table applications enable row level security;
create policy "applications_select" on applications for select using (is_authenticated_profile());
create policy "applications_insert" on applications for insert with check (is_admin());
create policy "applications_update" on applications for update using (is_admin()) with check (is_admin());
create policy "applications_delete" on applications for delete using (is_admin());

-- contacts
alter table contacts enable row level security;
create policy "contacts_select" on contacts for select using (is_authenticated_profile());
create policy "contacts_insert" on contacts for insert with check (is_admin());
create policy "contacts_update" on contacts for update using (is_admin()) with check (is_admin());
create policy "contacts_delete" on contacts for delete using (is_admin());

-- linkedin_activities
alter table linkedin_activities enable row level security;
create policy "linkedin_select" on linkedin_activities for select using (is_authenticated_profile());
create policy "linkedin_insert" on linkedin_activities for insert with check (is_admin());
create policy "linkedin_update" on linkedin_activities for update using (is_admin()) with check (is_admin());
create policy "linkedin_delete" on linkedin_activities for delete using (is_admin());

-- followups
alter table followups enable row level security;
create policy "followups_select" on followups for select using (is_authenticated_profile());
create policy "followups_insert" on followups for insert with check (is_admin());
create policy "followups_update" on followups for update using (is_admin()) with check (is_admin());
create policy "followups_delete" on followups for delete using (is_admin());

-- calls
alter table calls enable row level security;
create policy "calls_select" on calls for select using (is_authenticated_profile());
create policy "calls_insert" on calls for insert with check (is_admin());
create policy "calls_update" on calls for update using (is_admin()) with check (is_admin());
create policy "calls_delete" on calls for delete using (is_admin());

-- proposals
alter table proposals enable row level security;
create policy "proposals_select" on proposals for select using (is_authenticated_profile());
create policy "proposals_insert" on proposals for insert with check (is_admin());
create policy "proposals_update" on proposals for update using (is_admin()) with check (is_admin());
create policy "proposals_delete" on proposals for delete using (is_admin());

-- deals
alter table deals enable row level security;
create policy "deals_select" on deals for select using (is_authenticated_profile());
create policy "deals_insert" on deals for insert with check (is_admin());
create policy "deals_update" on deals for update using (is_admin()) with check (is_admin());
create policy "deals_delete" on deals for delete using (is_admin());

-- activity_log
alter table activity_log enable row level security;
create policy "activity_select" on activity_log for select using (is_authenticated_profile());
create policy "activity_insert" on activity_log for insert with check (is_admin());
create policy "activity_delete" on activity_log for delete using (is_admin());
