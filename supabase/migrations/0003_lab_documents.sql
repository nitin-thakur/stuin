-- 0003_lab_documents.sql
-- The hero feature's storage: a structured lab-practical write-up per student
-- per experiment. Private to its author (admins may read for moderation).

create table if not exists public.lab_documents (
  id            uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments (id) on delete cascade,
  author_id     uuid not null references public.profiles (id) on delete cascade,

  -- Structured template fields (all plain text; sanitized again at export).
  title         text not null default '',
  aim           text not null default '',
  apparatus     text not null default '',   -- apparatus / software
  theory        text not null default '',
  procedure     text not null default '',
  code          text not null default '',
  observations  text not null default '',
  output        text not null default '',
  result        text not null default '',
  -- Viva questions as an ordered list of {question, answer}.
  viva          jsonb not null default '[]'::jsonb,

  status        text not null default 'draft'
                  check (status in ('draft', 'final')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One write-up per student per experiment.
  unique (experiment_id, author_id)
);
create index if not exists lab_documents_author_idx on public.lab_documents (author_id);

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lab_documents_touch on public.lab_documents;
create trigger lab_documents_touch
  before update on public.lab_documents
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: author-scoped CRUD; admins may read
-- ---------------------------------------------------------------------------
alter table public.lab_documents enable row level security;

create policy lab_documents_select on public.lab_documents
  for select using (author_id = auth.uid() or public.is_admin());

create policy lab_documents_insert on public.lab_documents
  for insert with check (author_id = auth.uid());

create policy lab_documents_update on public.lab_documents
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy lab_documents_delete on public.lab_documents
  for delete using (author_id = auth.uid());
