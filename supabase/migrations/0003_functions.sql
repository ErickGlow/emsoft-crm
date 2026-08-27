-- EMSOFT CRM — business logic: follow-up engine + auto activity feed

-- ---------------------------------------------------------------------
-- Complete a followup: marks it done, auto-schedules the next step
-- using the admin's configured intervals, updates the parent's
-- next_followup_date. Returns the newly created followup row (or null
-- if the sequence has ended).
-- ---------------------------------------------------------------------
create or replace function complete_followup(p_followup_id uuid, p_notes text default null)
returns followups as $$
declare
  f followups;
  s followup_settings;
  next_step int;
  next_days int;
  new_row followups;
begin
  if not is_admin() then
    raise exception 'only admin can complete followups';
  end if;

  select * into f from followups where id = p_followup_id for update;
  if not found then
    raise exception 'followup not found';
  end if;

  update followups
    set status = 'completed', completed_at = now(), notes = coalesce(p_notes, notes)
    where id = p_followup_id;

  select * into s from followup_settings where owner_id = f.owner_id;
  if not found then
    -- fall back to defaults if settings row is missing
    s.interval_1_days := 3; s.interval_2_days := 7; s.interval_3_days := 30;
  end if;

  next_step := f.step + 1;
  if next_step > 3 then
    -- sequence finished; clear next_followup_date on parent
    if f.owner_type = 'contact' then
      update contacts set next_followup_date = null, last_contact_date = now() where id = f.contact_id;
    else
      update applications set updated_at = now() where id = f.application_id;
    end if;
    insert into activity_log (owner_id, kind, title, subtitle, occurred_at, ref_table, ref_id)
      values (f.owner_id, 'followup_completed', 'Follow-up sequence completed', null, now(), 'followups', f.id);
    return null;
  end if;

  next_days := case next_step
    when 1 then s.interval_1_days
    when 2 then s.interval_2_days
    when 3 then s.interval_3_days
  end;

  insert into followups (owner_id, owner_type, contact_id, application_id, step, status, due_date)
    values (f.owner_id, f.owner_type, f.contact_id, f.application_id, next_step, 'scheduled', (current_date + next_days))
    returning * into new_row;

  if f.owner_type = 'contact' then
    update contacts set next_followup_date = new_row.due_date, last_contact_date = now() where id = f.contact_id;
  else
    update applications set updated_at = now() where id = f.application_id;
  end if;

  insert into activity_log (owner_id, kind, title, subtitle, occurred_at, ref_table, ref_id)
    values (f.owner_id, 'followup_completed', 'Follow-up completed', 'Next step scheduled', now(), 'followups', f.id);

  return new_row;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------
-- Skip / reschedule / stop / restart a followup
-- ---------------------------------------------------------------------
create or replace function skip_followup(p_followup_id uuid) returns void as $$
begin
  if not is_admin() then raise exception 'only admin can modify followups'; end if;
  update followups set status = 'skipped' where id = p_followup_id;
end;
$$ language plpgsql security definer;

create or replace function reschedule_followup(p_followup_id uuid, p_new_due_date date) returns void as $$
begin
  if not is_admin() then raise exception 'only admin can modify followups'; end if;
  update followups set due_date = p_new_due_date, status = 'scheduled' where id = p_followup_id;
  update contacts c set next_followup_date = p_new_due_date
    from followups f where f.id = p_followup_id and f.contact_id = c.id;
end;
$$ language plpgsql security definer;

create or replace function stop_followup_sequence(p_followup_id uuid) returns void as $$
declare f followups;
begin
  if not is_admin() then raise exception 'only admin can modify followups'; end if;
  select * into f from followups where id = p_followup_id;
  update followups set status = 'stopped' where id = p_followup_id;
  if f.owner_type = 'contact' then
    update contacts set next_followup_date = null where id = f.contact_id;
  end if;
end;
$$ language plpgsql security definer;

create or replace function restart_followup_sequence(p_owner_type followup_owner_type, p_contact_id uuid, p_application_id uuid)
returns followups as $$
declare
  new_row followups;
  s followup_settings;
  oid uuid;
begin
  if not is_admin() then raise exception 'only admin can modify followups'; end if;
  select owner_id into oid from profiles where role = 'admin' limit 1;
  select * into s from followup_settings where owner_id = oid;

  insert into followups (owner_id, owner_type, contact_id, application_id, step, status, due_date)
    values (oid, p_owner_type, p_contact_id, p_application_id, 1, 'scheduled',
            current_date + coalesce(s.interval_1_days, 3))
    returning * into new_row;

  if p_owner_type = 'contact' then
    update contacts set next_followup_date = new_row.due_date where id = p_contact_id;
  end if;
  return new_row;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------
-- Contact reply pauses any active scheduled followups for that contact
-- ---------------------------------------------------------------------
create or replace function handle_contact_reply() returns trigger as $$
begin
  if new.status = 'replied' and old.status is distinct from 'replied' then
    update followups set status = 'paused'
      where contact_id = new.id and status = 'scheduled';
    insert into activity_log (owner_id, kind, title, subtitle, occurred_at, ref_table, ref_id)
      values (new.owner_id, 'contact_replied', 'Lead replied', new.name, now(), 'contacts', new.id);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_contact_reply after update on contacts
  for each row execute function handle_contact_reply();

-- ---------------------------------------------------------------------
-- Auto-populate activity_log from source tables on insert
-- ---------------------------------------------------------------------
create or replace function log_application_activity() returns trigger as $$
begin
  insert into activity_log (owner_id, kind, title, subtitle, link_url, amount, occurred_at, ref_table, ref_id)
    values (new.owner_id, 'application', new.job_title,
            new.platform::text || case when new.budget is not null then ' · $' || new.budget::text else '' end,
            new.job_url, new.budget, new.applied_at, 'applications', new.id);
  return new;
end;
$$ language plpgsql;
create trigger trg_log_application after insert on applications
  for each row execute function log_application_activity();

create or replace function log_linkedin_activity() returns trigger as $$
declare k activity_kind; link text; ttl text;
begin
  k := case new.activity_type
    when 'post' then 'linkedin_post'
    when 'comment' then 'linkedin_comment'
    when 'message' then 'linkedin_message'
    when 'followup' then 'linkedin_followup'
  end;
  link := coalesce(new.comment_url, new.conversation_url, new.post_url, new.profile_url);
  ttl := case new.activity_type
    when 'post' then 'LinkedIn Post'
    else coalesce(new.person_name, 'LinkedIn ' || new.activity_type::text)
  end;
  insert into activity_log (owner_id, kind, title, subtitle, link_url, occurred_at, ref_table, ref_id)
    values (new.owner_id, k, ttl, new.company, link, new.occurred_at, 'linkedin_activities', new.id);
  return new;
end;
$$ language plpgsql;
create trigger trg_log_linkedin after insert on linkedin_activities
  for each row execute function log_linkedin_activity();

create or replace function log_call_activity() returns trigger as $$
declare cname text;
begin
  select name into cname from contacts where id = new.contact_id;
  insert into activity_log (owner_id, kind, title, subtitle, occurred_at, ref_table, ref_id)
    values (new.owner_id, 'call', 'Call: ' || coalesce(cname, 'Unknown'), new.outcome::text, new.scheduled_at, 'calls', new.id);
  return new;
end;
$$ language plpgsql;
create trigger trg_log_call after insert on calls
  for each row execute function log_call_activity();

create or replace function log_proposal_activity() returns trigger as $$
begin
  insert into activity_log (owner_id, kind, title, subtitle, amount, occurred_at, ref_table, ref_id)
    values (new.owner_id, 'proposal', new.title, new.status::text, new.value, new.sent_at, 'proposals', new.id);
  return new;
end;
$$ language plpgsql;
create trigger trg_log_proposal after insert on proposals
  for each row execute function log_proposal_activity();

create or replace function log_deal_activity() returns trigger as $$
begin
  insert into activity_log (owner_id, kind, title, subtitle, amount, occurred_at, ref_table, ref_id)
    values (new.owner_id, 'won', new.title, 'Won project', new.value, new.won_at, 'deals', new.id);
  update contacts set status = 'won' where id = new.contact_id;
  update applications set status = 'won' where id = new.application_id;
  return new;
end;
$$ language plpgsql;
create trigger trg_log_deal after insert on deals
  for each row execute function log_deal_activity();

create or replace function log_contact_created() returns trigger as $$
begin
  insert into activity_log (owner_id, kind, title, subtitle, occurred_at, ref_table, ref_id)
    values (new.owner_id, 'contact_created', new.name, new.company, now(), 'contacts', new.id);
  return new;
end;
$$ language plpgsql;
create trigger trg_log_contact after insert on contacts
  for each row execute function log_contact_created();
