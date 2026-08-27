# EMSOFT CRM — Implementation Plan

## 1. Permission model
- 2 Supabase Auth users, tied 1:1 to `profiles` (id = auth.users.id).
- `profiles.role`: 'admin' | 'viewer'.
- Viacheslav = admin (full read/write). Evgeniy = viewer (read-only).
- Enforced at DB level via RLS: every write policy requires `profiles.role = 'admin'` for the requesting `auth.uid()`. Read policies allow both roles (any authenticated profile).
- Frontend also hides mutation UI for viewer, but this is UX only — DB is the real gate.

## 2. Route structure (App Router)
```
/login                          - Supabase Auth email/password
/(app)/dashboard                - KPI cards, filters, charts, followups summary
/(app)/applications             - table + filters, quick add
/(app)/linkedin                 - tabs: posts / comments / messages / followups
/(app)/followups                - today / overdue / upcoming, complete/skip/reschedule
/(app)/contacts                 - table view
/(app)/pipeline                 - kanban view of contacts by status
/(app)/reports                  - daily / weekly / monthly, conversion funnel, source comparison
/(app)/settings                 - followup intervals, defaults, profile, theme
/api/*                          - server route handlers for mutations needing extra validation/CSV export
```

## 3. Database schema (see supabase/migrations/0001_init.sql)
Entities: profiles, applications, linkedin_activities, contacts, followups, followup_settings,
calls, proposals, deals, activity_log (denormalized feed for fast reads).

## 4. Follow-up engine logic
- `followup_settings`: interval_1_days, interval_2_days, interval_3_days (defaults 3/7/30), per-profile (admin only, singleton row).
- A `followups` row belongs to either a `contact_id` or an `application_id` (exactly one).
- Sequence: `step` (0,1,2,3), `status` ('scheduled'|'completed'|'skipped'|'stopped'|'paused'), `due_date`, `completed_at`.
- Completing step N schedules step N+1 at `completed_at + interval_N+1_days` if N+1 <= 3, else sequence ends.
- Reply on a contact/application sets active followups to `paused`; user manually sets next date to resume (creates a new scheduled followup row, or resumes with a fresh due_date).
- Dashboard buckets: overdue = due_date < today & status='scheduled'; today = due_date = today & status='scheduled'; upcoming = due_date > today & status='scheduled' (within a window, default 14 days, shown as a list not filtered further).

## 5. Reporting
- All aggregation computed via SQL views/queries at request time (Postgres date_trunc), not stored — avoids drift. Given 2-user free-tier scale this is cheap.
- Conversion funnel computed from applications.status history counts + contacts.status counts, in a single reports query module (`lib/reports.ts`).

## 6. Build/verify gates
After each major section: `npm run typecheck`, `npm run lint`. Before delivery: `npm run build`.
