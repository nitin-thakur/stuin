-- 0001_profiles_and_identities.sql
-- Accounts, pluggable login identities, and the admin helper.
--
-- Design: `profiles` is the canonical ACCOUNT (1:1 with auth.users).
-- `auth_identities` records each login method linked to that account, so a new
-- provider (SSI/OIDC) attaches by inserting a row here — no schema refactor.

-- ---------------------------------------------------------------------------
-- profiles: the canonical account
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role         text not null default 'student'
                 check (role in ('student', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- auth_identities: login methods linked to an account
-- ---------------------------------------------------------------------------
create table if not exists public.auth_identities (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  provider    text not null,                 -- 'email', 'google', 'oidc:<issuer>'
  subject     text not null,                 -- provider's stable user id
  created_at  timestamptz not null default now(),
  unique (provider, subject)
);
create index if not exists auth_identities_profile_idx
  on public.auth_identities (profile_id);

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER bypasses RLS, avoiding policy recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- Auto-provision a profile + identity whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.auth_identities (profile_id, provider, subject)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    coalesce(new.raw_user_meta_data ->> 'sub', new.id::text)
  )
  on conflict (provider, subject) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block privilege escalation: only admins may change a profile's role.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'not authorized to change role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_role_escalation on public.profiles;
create trigger profiles_no_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();

-- ---------------------------------------------------------------------------
-- RLS: default-deny, then grant the minimum
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.auth_identities enable row level security;

-- A user sees their own profile; admins see all.
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- A user may update their own profile (role changes are blocked by trigger).
create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Identities are readable by their owner or an admin; writes are server-managed.
create policy auth_identities_select on public.auth_identities
  for select using (profile_id = auth.uid() or public.is_admin());
