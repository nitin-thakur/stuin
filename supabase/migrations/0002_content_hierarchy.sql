-- 0002_content_hierarchy.sql
-- University -> Branch -> Semester -> Subject -> Experiment.
-- The catalog is publicly readable; only admins may write it.

create table if not exists public.universities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.branches (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities (id) on delete cascade,
  name          text not null,
  slug          text not null,
  created_at    timestamptz not null default now(),
  unique (university_id, slug)
);

create table if not exists public.semesters (
  id         uuid primary key default gen_random_uuid(),
  branch_id  uuid not null references public.branches (id) on delete cascade,
  number     int  not null check (number between 1 and 12),
  name       text not null default '',
  created_at timestamptz not null default now(),
  unique (branch_id, number)
);

create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters (id) on delete cascade,
  name        text not null,
  code        text not null default '',
  slug        text not null,
  created_at  timestamptz not null default now(),
  unique (semester_id, slug)
);

create table if not exists public.experiments (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  number      int  not null check (number > 0),
  title       text not null,
  description text not null default '',
  created_at  timestamptz not null default now(),
  unique (subject_id, number)
);

create index if not exists branches_university_idx on public.branches (university_id);
create index if not exists semesters_branch_idx     on public.semesters (branch_id);
create index if not exists subjects_semester_idx     on public.subjects (semester_id);
create index if not exists experiments_subject_idx   on public.experiments (subject_id);

-- ---------------------------------------------------------------------------
-- RLS: public read, admin-only write on every catalog table
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'universities','branches','semesters','subjects','experiments'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format(
      'create policy %I on public.%I for select using (true);',
      t || '_select', t);

    execute format(
      'create policy %I on public.%I for insert with check (public.is_admin());',
      t || '_insert', t);

    execute format(
      'create policy %I on public.%I for update using (public.is_admin()) with check (public.is_admin());',
      t || '_update', t);

    execute format(
      'create policy %I on public.%I for delete using (public.is_admin());',
      t || '_delete', t);
  end loop;
end;
$$;
