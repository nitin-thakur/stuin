-- 0004_lab_manuals_and_review.sql
-- Lab-manual uploads per subject. Every upload lands as 'pending' and is
-- invisible to other users until an admin approves it. An append-only event
-- table records each moderation decision (audit trail).

create table if not exists public.lab_manuals (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.subjects (id) on delete cascade,
  uploaded_by       uuid not null references public.profiles (id) on delete cascade,

  title             text not null default '',
  -- Storage metadata. object_key is a RANDOM server-generated key; the
  -- client filename is retained only as a display label, never as a path.
  object_key        text not null unique,
  original_filename text not null,
  mime_type         text not null,
  size_bytes        bigint not null check (size_bytes >= 0),
  sha256            text,

  status            text not null default 'pending'
                      check (status in ('pending', 'approved', 'rejected')),
  reviewed_by       uuid references public.profiles (id),
  reviewed_at       timestamptz,
  review_note       text,

  created_at        timestamptz not null default now()
);
create index if not exists lab_manuals_subject_idx on public.lab_manuals (subject_id);
create index if not exists lab_manuals_status_idx  on public.lab_manuals (status);
create index if not exists lab_manuals_uploader_idx on public.lab_manuals (uploaded_by);

create table if not exists public.manual_review_events (
  id          uuid primary key default gen_random_uuid(),
  manual_id   uuid not null references public.lab_manuals (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id),
  action      text not null check (action in ('approved', 'rejected')),
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists manual_review_events_manual_idx
  on public.manual_review_events (manual_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.lab_manuals enable row level security;
alter table public.manual_review_events enable row level security;

-- Approved manuals are visible to any signed-in user; uploaders see their own
-- (any status); admins see everything.
create policy lab_manuals_select on public.lab_manuals
  for select using (
    (status = 'approved' and auth.uid() is not null)
    or uploaded_by = auth.uid()
    or public.is_admin()
  );

-- Anyone signed in may upload, but only as themselves and only as 'pending'.
create policy lab_manuals_insert on public.lab_manuals
  for insert with check (
    uploaded_by = auth.uid() and status = 'pending'
  );

-- Only admins moderate (approve/reject, set review fields).
create policy lab_manuals_update on public.lab_manuals
  for update using (public.is_admin()) with check (public.is_admin());

-- Uploaders may withdraw their own still-pending upload; admins may remove any.
create policy lab_manuals_delete on public.lab_manuals
  for delete using (
    public.is_admin()
    or (uploaded_by = auth.uid() and status = 'pending')
  );

-- Review events: admins write/read all; an uploader may read decisions on
-- their own manual.
create policy manual_review_events_insert on public.manual_review_events
  for insert with check (public.is_admin() and reviewer_id = auth.uid());

create policy manual_review_events_select on public.manual_review_events
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.lab_manuals m
      where m.id = manual_id and m.uploaded_by = auth.uid()
    )
  );
