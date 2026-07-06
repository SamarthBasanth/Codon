-- Codon cloud runs — metering for on-demand E2B sandbox execution of real
-- (non-browser) methods. Run once in the Supabase SQL editor. Writes happen
-- server-side with the service_role key; RLS stays on (no public policies).
-- If this table is absent, the server action still runs but skips the daily cap.

create table if not exists public.cloud_runs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_email  text not null,
  method_slug text not null,
  reproduced  boolean default false
);

create index if not exists cloud_runs_user_day on public.cloud_runs (user_email, created_at);
alter table public.cloud_runs enable row level security;
