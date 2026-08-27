# EMSOFT CRM

Internal business-development tracker for EMSOFT. Not a traditional sales CRM —
it tracks daily BD activity across Upwork, Guru, Freelancer, and LinkedIn, runs
an automatic follow-up engine, and generates daily/weekly/monthly reports.

Two users only:
- **Viacheslav** — admin, full read/write
- **Evgeniy** — viewer, read-only (enforced at the database level via RLS, not just the UI)

Stack: Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Vercel.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project's URL and anon key (see step 2).

```bash
npm run dev
```

App runs at `http://localhost:3000`.

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm run build         # production build
```

---

## 2. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com) (the free tier is
   enough for 2 users).
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**
   into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Run the migrations, in order, against your project. Easiest path: open the
   **SQL Editor** in the Supabase dashboard and paste/run each file in
   `supabase/migrations/` in numeric order:
   - `0001_init.sql` — schema (tables, enums, indexes)
   - `0002_rls.sql` — Row Level Security policies (admin read/write, viewer read-only)
   - `0003_functions.sql` — follow-up engine functions (`complete_followup`, etc.) and
     auto-populated activity feed triggers
   - `0004_auto_followups.sql` — auto-schedules a step-1 follow-up whenever a new
     application or contact is created

   (If you use the Supabase CLI instead: `supabase link` then `supabase db push`.)

4. **Create the two users** in **Authentication → Users → Add user** (email +
   password, or invite by email):
   - one for Viacheslav
   - one for Evgeniy

   Copy each user's UUID (shown in the users table).

5. Open `supabase/seed.sql`, replace the two placeholder UUIDs at the top with
   the real ones you just copied, then run the file in the SQL Editor. This:
   - creates the two `profiles` rows (admin / viewer)
   - creates default follow-up settings (3 / 7 / 30 days)
   - inserts realistic demo data: ~12 applications across all platforms, 8
     contacts at different pipeline stages, LinkedIn posts/comments/messages,
     a couple of calls/proposals, one won deal, and a mix of overdue/today/
     upcoming follow-ups so the dashboard isn't empty on first login.

   If you'd rather start from a completely empty workspace, skip the
   `applications` / `contacts` / `linkedin_activities` / `calls` / `proposals`
   / `deals` inserts and only run the `profiles` + `followup_settings` blocks.

---

## 3. Log in

Go to `/login` and sign in with the email/password you set for Viacheslav or
Evgeniy in Supabase Auth. Viacheslav sees the full app; Evgeniy sees everything
but every mutation control (quick-add buttons, status dropdowns, drag-and-drop,
settings form) is hidden or disabled — and blocked server-side even if someone
tried to bypass the UI.

---

## 4. Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Add New Project** → import the repo.
3. Add the two environment variables (same values as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Framework preset is auto-detected as Next.js — no build command
   changes needed.

### Custom domain (crm.emsoftmn.com)

1. In the Vercel project → **Settings → Domains**, add `crm.emsoftmn.com`.
2. Vercel will show a CNAME (or A) record to add at your DNS provider for
   `emsoftmn.com`. Add it there.
3. Wait for DNS propagation and SSL provisioning (usually a few minutes to a
   few hours). Vercel handles HTTPS automatically once verified.

---

## 5. How the follow-up engine works

- Every new application or contact automatically gets a **step-1 follow-up**
  scheduled `interval_1_days` (default 3) in the future — you never have to
  remember to schedule the first one.
- Marking a follow-up **Complete** calls a Postgres function
  (`complete_followup`) that, in one transaction: marks the current step
  done, and — if there's a next step (max 3) — schedules it using
  `interval_2_days` / `interval_3_days` from Settings.
- **Skip** marks the current step skipped without scheduling a next one.
- **Reschedule** moves the due date without changing the step.
- **Stop** ends the sequence for that contact/application entirely.
- If a contact's status changes to **Replied**, any of their active scheduled
  follow-ups automatically pause — you set the next date manually from there.
- All of this logic lives in `supabase/migrations/0003_functions.sql` and
  `0004_auto_followups.sql`, not in the frontend — so it's transactional and
  can't be bypassed by a buggy client.

Follow-up intervals are configurable in **Settings** (admin only).

---

## 6. Permissions model

- `profiles.role` is `'admin'` or `'viewer'`.
- Every table's Row Level Security policy allows `SELECT` to any authenticated
  profile, but `INSERT` / `UPDATE` / `DELETE` require `role = 'admin'` — checked
  with a `SECURITY DEFINER` `is_admin()` function against `auth.uid()`.
- The frontend also hides mutation UI for the viewer role (via
  `useIsAdmin()` / `ProfileContext`), but that's UX polish only — the real
  gate is the database. A viewer calling the API directly still gets rejected.

---

## 7. CSV export

Admin-only. Available from the **Reports** page: Applications, Contacts, and
Activity export as CSV via `/api/export?type=applications|contacts|activity`.
The route checks the caller's role server-side before returning any data.

---

## 8. Known limitations / notes on business-logic assumptions

The original brief had a few numbers that are inherently ambiguous without
more context (e.g., what exactly counts as a "Reply," whether "Active
Conversations" should be date-filtered or a live snapshot). Where that came
up, the choice made and the reasoning is commented directly above the
relevant query in `src/lib/data/dashboard.ts` — worth a skim before you trust
a specific number in a client-facing report.

- The `middleware.ts` file convention is deprecated in the installed Next.js
  version in favor of a `proxy.ts` convention; middleware still works (this
  is only a forward-looking deprecation warning at build time), but it's
  worth migrating with `npx @next/codemod@canary middleware-to-proxy .` next
  time you touch auth routing.
- Kanban drag-and-drop uses the native HTML5 Drag and Drop API (no extra
  dependency) — it works well with a mouse; if touch-device dragging becomes
  important later, that's the place to add a small dedicated library.
