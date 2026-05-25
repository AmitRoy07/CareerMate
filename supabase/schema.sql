create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.resume_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  section_key text not null,
  content jsonb not null,
  sort_order int default 0
);

create table if not exists public.ai_resume_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  ats_score int not null,
  missing_keywords text[] default '{}',
  suggestions jsonb not null,
  rewritten_summary text,
  created_at timestamptz default now()
);

create table if not exists public.salary_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.interview_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0
);

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.interview_categories(id) on delete cascade,
  question text not null,
  answer text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  interview_question_id uuid references public.interview_questions(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, interview_question_id)
);

create table if not exists public.vault_documents (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null,
  mime_type text not null,
  size bigint,
  cloud_uri text,
  synced_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null default 'free' check (plan_type in ('free', 'premium', 'pro')),
  status text not null default 'active' check (status in ('active', 'inactive', 'cancelled', 'expired')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  provider text,
  provider_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider_subscription_id)
);

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_key text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'expired')),
  source text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, entitlement_key)
);

create table if not exists public.user_credit_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_type text not null,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz default now(),
  unique (user_id, credit_type)
);

create table if not exists public.user_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_type text not null,
  transaction_type text not null check (transaction_type in ('grant', 'consume', 'refund', 'expire')),
  amount integer not null,
  reason text,
  reference_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.resume_analysis_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  target_role text,
  job_description_hash text,
  overall_score integer not null,
  ats_score integer not null,
  report_json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.job_match_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  target_role text,
  match_score integer not null,
  report_json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.saved_hr_mails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mail_type text not null,
  tone text not null,
  subject text not null,
  body text not null,
  short_message text,
  created_at timestamptz default now()
);

alter table public.users_profile enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_sections enable row level security;
alter table public.ai_resume_reports enable row level security;
alter table public.salary_calculations enable row level security;
alter table public.user_favorites enable row level security;
alter table public.vault_documents enable row level security;
alter table public.user_plans enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.user_credit_balances enable row level security;
alter table public.user_credit_transactions enable row level security;
alter table public.resume_analysis_reports enable row level security;
alter table public.job_match_reports enable row level security;
alter table public.saved_hr_mails enable row level security;

create policy "Users manage own profile" on public.users_profile for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own resumes" on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own resume sections" on public.resume_sections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own AI reports" on public.ai_resume_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own salary calculations" on public.salary_calculations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own favorites" on public.user_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own vault documents" on public.vault_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own plans" on public.user_plans for select using (auth.uid() = user_id);
create policy "Users read own entitlements" on public.user_entitlements for select using (auth.uid() = user_id);
create policy "Users read own credit balances" on public.user_credit_balances for select using (auth.uid() = user_id);
create policy "Users read own credit transactions" on public.user_credit_transactions for select using (auth.uid() = user_id);
create policy "Users read own resume analysis reports" on public.resume_analysis_reports for select using (auth.uid() = user_id);
create policy "Users insert own resume analysis reports" on public.resume_analysis_reports for insert with check (auth.uid() = user_id);
create policy "Users read own job match reports" on public.job_match_reports for select using (auth.uid() = user_id);
create policy "Users insert own job match reports" on public.job_match_reports for insert with check (auth.uid() = user_id);
create policy "Users read own saved HR mails" on public.saved_hr_mails for select using (auth.uid() = user_id);
create policy "Users insert own saved HR mails" on public.saved_hr_mails for insert with check (auth.uid() = user_id);
create policy "Users delete own saved HR mails" on public.saved_hr_mails for delete using (auth.uid() = user_id);

create policy "Anyone can read categories" on public.interview_categories for select using (true);
create policy "Anyone can read questions" on public.interview_questions for select using (true);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Users upload own avatars" on storage.objects
  for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own avatars" on storage.objects
  for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can read avatars" on storage.objects
  for select
  using (bucket_id = 'avatars');

insert into storage.buckets (id, name, public)
values ('vault-documents', 'vault-documents', false)
on conflict (id) do nothing;

create policy "Users upload own vault documents" on storage.objects
  for insert
  with check (bucket_id = 'vault-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own vault documents" on storage.objects
  for update
  using (bucket_id = 'vault-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users read own vault documents" on storage.objects
  for select
  using (bucket_id = 'vault-documents' and auth.uid()::text = (storage.foldername(name))[1]);
