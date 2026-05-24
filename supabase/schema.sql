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

alter table public.users_profile enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_sections enable row level security;
alter table public.ai_resume_reports enable row level security;
alter table public.salary_calculations enable row level security;
alter table public.user_favorites enable row level security;

create policy "Users manage own profile" on public.users_profile for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own resumes" on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own resume sections" on public.resume_sections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own AI reports" on public.ai_resume_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own salary calculations" on public.salary_calculations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own favorites" on public.user_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
