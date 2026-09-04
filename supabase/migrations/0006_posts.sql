-- EMSOFT CRM — Posts approval workflow
--
-- A "posts" table for drafting LinkedIn posts before publishing, with a
-- lightweight approval step. Unlike every other table, BOTH admin and
-- viewer can approve a post — approval is a deliberate, narrow exception
-- to the normal admin-write/viewer-read-only model, implemented as a
-- scoped RPC function rather than loosening the general UPDATE policy.

create type post_status as enum ('pending', 'approved');

create table posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  status post_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_posts_status on posts(status);
create index idx_posts_created on posts(created_at desc);

alter table posts enable row level security;

-- Read: any authenticated profile (same as every other table)
create policy "posts_select" on posts for select using (is_authenticated_profile());

-- Write (create/edit/delete): admin only — same convention as everywhere else.
-- Approval specifically goes through approve_post() below, not this policy.
create policy "posts_insert" on posts for insert with check (is_admin());
create policy "posts_update" on posts for update using (is_admin()) with check (is_admin());
create policy "posts_delete" on posts for delete using (is_admin());

-- ---------------------------------------------------------------------
-- approve_post — the one deliberate exception: any authenticated
-- profile (admin OR viewer) may call this to approve a pending post.
-- SECURITY DEFINER lets it bypass the admin-only UPDATE policy above,
-- but only for exactly this narrow effect (status + approval metadata),
-- nothing else about the row is touched.
-- ---------------------------------------------------------------------
create or replace function approve_post(p_post_id uuid) returns posts as $$
declare
  result posts;
begin
  if not is_authenticated_profile() then
    raise exception 'must be logged in to approve a post';
  end if;

  update posts
    set status = 'approved', approved_at = now(), approved_by = auth.uid()
    where id = p_post_id and status = 'pending'
    returning * into result;

  if not found then
    raise exception 'post not found or already approved';
  end if;

  return result;
end;
$$ language plpgsql security definer;

-- Log approved/new posts into the existing activity feed, same as every
-- other table, so they show up in the Activity Feed and daily reports.
create or replace function log_post_created() returns trigger as $$
begin
  insert into activity_log (owner_id, kind, title, subtitle, occurred_at, ref_table, ref_id)
    values (new.owner_id, 'linkedin_post', 'Post drafted (pending approval)', left(new.content, 80), new.created_at, 'posts', new.id);
  return new;
end;
$$ language plpgsql;
create trigger trg_log_post_created after insert on posts
  for each row execute function log_post_created();
