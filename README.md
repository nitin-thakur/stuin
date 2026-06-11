# stuin

A study platform for college students. **Phase-1 MVP** — built secure by
default. See [`CLAUDE.md`](./CLAUDE.md) for the standing engineering rules.

## What's in Phase 1

- **Pluggable auth** — email + Google, with accounts decoupled from login
  methods so an SSI/OIDC provider can be added later (see
  `src/lib/auth/providers/`).
- **Content hierarchy** — University → Branch → Semester → Subject → Experiment,
  browsable at `/catalog`.
- **Lab Practical Documentation** (hero) — a structured template (aim,
  apparatus/software, theory, procedure, code, observations, output, result,
  viva) that you save, edit, and export as **PDF and DOCX**. Generation is
  server-side and sanitizes all user content.
- **Lab-manual upload & browse** per subject, with secure upload controls. Every
  upload goes to the **admin review queue** and is invisible to others until
  approved.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth,
Storage). PDFs via `pdfkit`, DOCX via `docx`.

## Local setup

1. **Install**

   ```bash
   npm install
   ```

2. **Create a Supabase project**, then copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from the
     project's API settings.
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only; never expose to the browser.

3. **Apply the database schema** (in order) from `supabase/migrations/` —
   either with the Supabase CLI (`supabase db push`) or by pasting each file
   into the SQL editor. They enable RLS on every table, create the
   account/identity model, the content hierarchy, lab documents, lab manuals +
   review queue, and the private `lab-manuals` storage bucket. Optionally load
   `supabase/seed.sql` for sample catalog data.

4. **Enable auth providers** in the Supabase dashboard: Email, and Google
   (add the OAuth client + set the redirect URL to
   `<site>/auth/callback`).

5. **Make yourself an admin** (to access `/admin/review`):

   ```sql
   update public.profiles set role = 'admin' where id = '<your-auth-user-id>';
   ```

6. **Run**

   ```bash
   npm run dev
   ```

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Security notes

- RLS is the security boundary; UI checks are convenience only.
- Secrets live in `.env*.local` (gitignored). The service-role key is
  server-only.
- A nonce-based CSP and security headers are applied in `middleware.ts` /
  `next.config.mjs`.
- Uploads are validated by extension allowlist + magic bytes, capped in size,
  stored under random keys in a private bucket, and held for admin review.
