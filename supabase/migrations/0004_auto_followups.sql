-- Automatically schedules step-1 follow-up when a new application or
-- contact is created, using the admin's configured interval_1_days.
-- This is what makes "I never have to remember to schedule a follow-up" true.

create or replace function auto_schedule_application_followup() returns trigger as $$
declare interval_days int;
begin
  select interval_1_days into interval_days from followup_settings where owner_id = new.owner_id;
  insert into followups (owner_id, owner_type, application_id, step, status, due_date)
    values (new.owner_id, 'application', new.id, 1, 'scheduled', (current_date + coalesce(interval_days, 3)));
  return new;
end;
$$ language plpgsql;

create trigger trg_auto_followup_application after insert on applications
  for each row execute function auto_schedule_application_followup();

create or replace function auto_schedule_contact_followup() returns trigger as $$
declare interval_days int; new_due date;
begin
  select interval_1_days into interval_days from followup_settings where owner_id = new.owner_id;
  new_due := current_date + coalesce(interval_days, 3);
  insert into followups (owner_id, owner_type, contact_id, step, status, due_date)
    values (new.owner_id, 'contact', new.id, 1, 'scheduled', new_due);
  update contacts set next_followup_date = new_due where id = new.id;
  return new;
end;
$$ language plpgsql;

create trigger trg_auto_followup_contact after insert on contacts
  for each row execute function auto_schedule_contact_followup();
