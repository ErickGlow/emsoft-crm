-- Additive workflow: important messages awaiting Eugene's reply + viewer-safe post editing.
-- Existing CRM tables/workflows are intentionally untouched.

create type attention_message_status as enum ('waiting', 'resolved');

create table attention_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  person_name text not null,
  company text,
  message_text text not null,
  conversation_url text,
  notes text,
  status attention_message_status not null default 'waiting',
  resolved_at timestamptz,
  resolved_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_attention_messages_status on attention_messages(status);
create index idx_attention_messages_created on attention_messages(created_at desc);

alter table attention_messages enable row level security;
create policy "attention_messages_select" on attention_messages for select using (is_authenticated_profile());
create policy "attention_messages_insert" on attention_messages for insert with check (is_admin());
create policy "attention_messages_update" on attention_messages for update using (is_admin()) with check (is_admin());
create policy "attention_messages_delete" on attention_messages for delete using (is_admin());

-- Eugene/viewer can mark an item handled without getting general write access.
create or replace function resolve_attention_message(p_message_id uuid) returns attention_messages as $$
declare result attention_messages;
begin
  if not is_authenticated_profile() then raise exception 'must be logged in'; end if;
  update attention_messages
     set status='resolved', resolved_at=now(), resolved_by=auth.uid()
   where id=p_message_id and status='waiting'
   returning * into result;
  if not found then raise exception 'message not found or already resolved'; end if;
  return result;
end;
$$ language plpgsql security definer;

-- Eugene/viewer can edit ONLY the text of a pending post before approval.
create or replace function edit_pending_post(p_post_id uuid, p_content text) returns posts as $$
declare result posts;
begin
  if not is_authenticated_profile() then raise exception 'must be logged in'; end if;
  if length(trim(p_content)) = 0 then raise exception 'post content cannot be empty'; end if;
  update posts set content=trim(p_content)
   where id=p_post_id and status='pending'
   returning * into result;
  if not found then raise exception 'post not found or already approved'; end if;
  return result;
end;
$$ language plpgsql security definer;
