-- EMSOFT CRM — seed data (Viacheslav only — Evgeniy added later)

insert into profiles (id, full_name, role, timezone, currency, theme) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Viacheslav', 'admin', 'America/Chicago', 'USD', 'system')
on conflict (id) do nothing;

insert into followup_settings (owner_id, interval_1_days, interval_2_days, interval_3_days, default_platform)
values ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 3, 7, 30, 'upwork')
on conflict (owner_id) do nothing;

insert into applications (owner_id, platform, job_title, client_name, job_url, budget, applied_at, status, potential_value, notes) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'upwork', 'Next.js SaaS Development Platform', 'Northwind Analytics', 'https://upwork.com/jobs/nextjs-saas-1', 5000, now() - interval '6 days', 'proposal', 5000, 'Strong fit, they liked the portfolio piece on multi-tenant dashboards'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'upwork', 'React Native Mobile App MVP', 'Fitloop', 'https://upwork.com/jobs/rn-mvp-2', 3200, now() - interval '4 days', 'replied', 3200, 'Client wants a call this week'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'upwork', 'API Integration — Stripe + QuickBooks', 'Ledgerly', 'https://upwork.com/jobs/stripe-qb-3', 1800, now() - interval '2 days', 'applied', 1800, null),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'upwork', 'WordPress to Headless Migration', 'Coastal Realty Group', 'https://upwork.com/jobs/wp-headless-4', 2400, now() - interval '1 day', 'applied', 2400, null),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'upwork', 'AI Chatbot for Customer Support', 'HelpDeskly', 'https://upwork.com/jobs/ai-chatbot-5', 4500, now(), 'applied', 4500, 'Mentioned budget flexibility for the right fit'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'guru', 'Laravel Backend Refactor', 'Vantage Freight', 'https://guru.com/jobs/laravel-refactor-1', 2800, now() - interval '5 days', 'followup', 2800, null),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'guru', 'Custom CRM Build', 'Solar Bright Co', 'https://guru.com/jobs/custom-crm-2', 6000, now() - interval '3 days', 'applied', 6000, null),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'guru', 'E-commerce Performance Audit', 'Kettleworks', 'https://guru.com/jobs/perf-audit-3', 900, now(), 'applied', 900, null),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'freelancer', 'Python Data Pipeline', 'Meridian Logistics', 'https://freelancer.com/projects/py-pipeline-1', 3500, now() - interval '7 days', 'interview', 3500, 'Call scheduled — see Calls'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'freelancer', 'Shopify App Development', 'Bristle & Co', 'https://freelancer.com/projects/shopify-app-2', 2200, now() - interval '2 days', 'applied', 2200, null),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'freelancer', 'DevOps / CI-CD Setup', 'Norther Systems', 'https://freelancer.com/projects/devops-3', 1500, now() - interval '10 days', 'lost', 1500, 'Went with an agency instead'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'other', 'Referral: Internal Tool for Accounting Firm', 'Halden & Cross CPA', null, 4000, now() - interval '8 days', 'won', 4000, 'Closed via warm referral');

insert into contacts (owner_id, name, company, position, source, linkedin_profile_url, linkedin_conversation_url, email, potential_project, potential_value, notes, status, last_contact_date) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Michael Smith', 'Northwind Analytics', 'Founder', 'linkedin', 'https://linkedin.com/in/michael-smith-founder', 'https://linkedin.com/messaging/thread/1', 'michael@northwind.io', 'Dashboard rebuild', 8000, 'Very responsive, technical background', 'qualified', now() - interval '1 day'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Jamie Lin', 'Fitloop', 'CEO', 'upwork', null, null, 'jamie@fitloop.app', 'Mobile app v2', 3200, null, 'in_contact', now() - interval '2 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Thomas Reyes', 'Startup XYZ', 'CTO', 'linkedin', 'https://linkedin.com/in/thomas-reyes', 'https://linkedin.com/messaging/thread/2', null, 'AI automation for support tickets', 12000, 'Replied enthusiastically to cold message', 'replied', now() - interval '3 hours'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Priya Nair', 'Solar Bright Co', 'Ops Manager', 'guru', null, null, 'priya@solarbright.co', 'Custom CRM', 6000, null, 'proposal', now() - interval '4 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Daniel Okafor', 'Meridian Logistics', 'VP Engineering', 'freelancer', null, null, 'daniel@meridianlog.com', 'Data pipeline + dashboard', 5500, 'Call booked for Thursday', 'call_scheduled', now() - interval '1 day'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Sara Kwon', 'Halden & Cross CPA', 'Partner', 'referral', null, null, 'sara@haldencross.com', 'Internal accounting tool', 4000, 'Closed — see Won Projects', 'won', now() - interval '8 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Owen Patel', 'Vantage Freight', 'Founder', 'linkedin', 'https://linkedin.com/in/owen-patel', 'https://linkedin.com/messaging/thread/3', null, 'Backend refactor', 2800, 'Went quiet after initial reply', 'contacted', now() - interval '6 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', 'Elena Voss', 'Kettleworks', 'Marketing Director', 'linkedin', 'https://linkedin.com/in/elena-voss', null, null, 'Performance audit', 900, null, 'contacted', now() - interval '2 days');

insert into linkedin_activities (owner_id, contact_id, activity_type, person_name, company, profile_url, post_url, comment_url, content, reply_status, occurred_at) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', null, 'post', null, null, null, 'https://linkedin.com/posts/emsoft-1', null, 'Shared a short write-up on why most internal tools fail in the first 90 days.', 'no_reply', now() - interval '1 day'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Michael Smith'), 'comment', 'Michael Smith', 'Northwind Analytics', 'https://linkedin.com/in/michael-smith-founder', 'https://linkedin.com/posts/northwind-growth', 'https://linkedin.com/posts/northwind-growth#comment-1', 'This resonates — we hit the exact same wall with our reporting stack.', 'replied', now() - interval '2 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Thomas Reyes'), 'comment', 'Thomas Reyes', 'Startup XYZ', 'https://linkedin.com/in/thomas-reyes', 'https://linkedin.com/posts/xyz-support-load', null, 'Curious how you approached the triage logic here.', 'no_reply', now() - interval '3 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Elena Voss'), 'comment', 'Elena Voss', 'Kettleworks', 'https://linkedin.com/in/elena-voss', 'https://linkedin.com/posts/kettleworks-launch', null, 'Congrats on the launch — the checkout flow looks clean.', 'no_reply', now() - interval '5 hours'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Michael Smith'), 'message', 'Michael Smith', 'Northwind Analytics', 'https://linkedin.com/in/michael-smith-founder', null, null, 'Hey Michael — following up on the dashboard project, happy to send over a short proposal this week.', 'replied', now() - interval '1 day'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Jamie Lin'), 'message', 'Jamie Lin', 'Fitloop', null, null, null, 'Sent over the v2 scope doc, let me know if the timeline works.', 'no_reply', now() - interval '2 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Owen Patel'), 'followup', 'Owen Patel', 'Vantage Freight', 'https://linkedin.com/in/owen-patel', null, null, 'Checking back in — still happy to help with the backend refactor whenever it makes sense.', 'no_reply', now() - interval '1 day'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', null, 'post', null, null, null, 'https://linkedin.com/posts/emsoft-2', null, 'Posted a before/after of a client dashboard rebuild (Next.js + Supabase).', 'no_reply', now() - interval '4 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Priya Nair'), 'comment', 'Priya Nair', 'Solar Bright Co', null, 'https://linkedin.com/posts/solarbright-hiring', null, 'We are actually looking for exactly this right now.', 'replied', now() - interval '4 days'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Daniel Okafor'), 'message', 'Daniel Okafor', 'Meridian Logistics', null, null, null, 'Confirmed for Thursday 2pm CT — sending a calendar invite now.', 'replied', now() - interval '1 day');

insert into calls (owner_id, contact_id, scheduled_at, outcome, notes) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Daniel Okafor'), now() + interval '2 days', 'scheduled', 'Discovery call — data pipeline scope'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Michael Smith'), now() - interval '3 days', 'completed', 'Went well, sending proposal this week');

insert into proposals (owner_id, contact_id, application_id, title, value, status, sent_at, notes) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Priya Nair'), (select id from applications where job_title = 'Custom CRM Build'), 'Custom CRM — Phase 1 Proposal', 6000, 'sent', now() - interval '3 days', 'Awaiting response'),
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', null, (select id from applications where job_title = 'Next.js SaaS Development Platform'), 'Dashboard Rebuild Proposal', 5000, 'sent', now() - interval '5 days', null);

insert into deals (owner_id, contact_id, application_id, title, value, status, won_at, notes) values
  ('fcd5b694-d40f-4b03-9cb3-e36f5c70f186', (select id from contacts where name = 'Sara Kwon'), (select id from applications where job_title = 'Referral: Internal Tool for Accounting Firm'), 'Internal Accounting Tool', 4000, 'won', now() - interval '2 days', 'First milestone invoiced');

update followups set due_date = current_date - 3
  where application_id = (select id from applications where job_title = 'Laravel Backend Refactor') and status = 'scheduled';

update followups set due_date = current_date - 1
  where contact_id = (select id from contacts where name = 'Owen Patel') and status = 'scheduled';

update followups set due_date = current_date
  where application_id = (select id from applications where job_title = 'React Native Mobile App MVP') and status = 'scheduled';

update followups set due_date = current_date
  where contact_id = (select id from contacts where name = 'Elena Voss') and status = 'scheduled';

update followups set due_date = current_date + 5
  where application_id = (select id from applications where job_title = 'API Integration — Stripe + QuickBooks') and status = 'scheduled';

update followups set due_date = current_date + 10
  where contact_id = (select id from contacts where name = 'Jamie Lin') and status = 'scheduled';

do $$
declare
  fu followups;
  next_due date;
begin
  select * into fu from followups
    where contact_id = (select id from contacts where name = 'Michael Smith') and status = 'scheduled'
    limit 1;

  if found then
    update followups set status = 'completed', completed_at = now() where id = fu.id;
    next_due := current_date + 7;
    insert into followups (owner_id, owner_type, contact_id, step, status, due_date)
      values (fu.owner_id, 'contact', fu.contact_id, 2, 'scheduled', next_due);
    update contacts set next_followup_date = next_due, last_contact_date = now() where id = fu.contact_id;
  end if;
end $$;