-- EMSOFT CRM — Add Application flow update
--
-- 1. Adds "Direct" as a selectable platform (alongside Upwork, Guru,
--    Freelancer, LinkedIn, Referral, Other).
-- 2. Fixes the step-1 follow-up auto-scheduler: applied_at is now
--    user-editable in the UI (e.g. logging an application you actually
--    submitted a couple of days ago), so the first follow-up must be
--    calculated from applied_at, not from "today". Previously it always
--    used current_date, which was only correct when applied_at == today.

-- ---------------------------------------------------------------------
-- 1. New enum value
-- ---------------------------------------------------------------------
alter type platform_type add value if not exists 'direct';

-- ---------------------------------------------------------------------
-- 2. Base the first follow-up on applied_at instead of current_date
-- ---------------------------------------------------------------------
create or replace function auto_schedule_application_followup() returns trigger as $$
declare interval_days int;
begin
  select interval_1_days into interval_days from followup_settings where owner_id = new.owner_id;
  insert into followups (owner_id, owner_type, application_id, step, status, due_date)
    values (new.owner_id, 'application', new.id, 1, 'scheduled', (new.applied_at::date + coalesce(interval_days, 3)));
  return new;
end;
$$ language plpgsql;

-- trigger already exists and references this function by name — no need
-- to recreate it, "create or replace function" above is enough.
