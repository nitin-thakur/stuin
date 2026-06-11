-- 0005_storage_bucket.sql
-- Private Storage bucket for lab-manual uploads.
--
-- The bucket is PRIVATE and has NO public storage RLS policies, so neither anon
-- nor authenticated roles can read/write objects directly. All access goes
-- through trusted server code using the service-role key (upload with a random
-- key; download via short-lived signed URLs after an auth + approval check).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lab-manuals',
  'lab-manuals',
  false,
  26214400, -- 25 MiB hard cap at the storage layer (app enforces its own too)
  array['application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
