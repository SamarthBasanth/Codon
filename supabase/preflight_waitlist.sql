-- Codon Preflight — early-access waitlist.
-- Run once in the Supabase SQL editor (project ijfgonujgdytykfyxjlf).
-- Inserts happen server-side via the service_role key (bypasses RLS), so no
-- anon policy is needed; RLS stays on to keep the table private to the browser.

create table if not exists public.preflight_waitlist (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  email        text not null unique,
  name         text,
  role         text,
  organization text,
  use_case     text,
  source       text default 'preflight'
);

alter table public.preflight_waitlist enable row level security;

-- Optional: read your leads from the SQL editor / a service-role dashboard.
-- No public SELECT/INSERT policies on purpose — the app writes with the service key.
