# CLAUDE.md — Standing Rules for `stuin`

`stuin` is a study platform for college students. It is built **secure by
default**. These standing rules apply to every task in this repository; keep
them current as the system evolves.

## Product phases

- **Phase 1 (current MVP):**
  - Pluggable auth — email + Google to start.
  - Content hierarchy: University → Branch → Semester → Subject → Experiment.
  - Hero feature: **Lab Practical Documentation** — structured template
    (aim, apparatus/software, theory, procedure, code, observations, output,
    result, viva questions) → save/edit → sanitized **PDF and DOCX** export.
  - Lab-manual upload + browse per subject, routed to an **admin review queue**.
- **Phases 2–4: not yet built.** Do not implement them unless a task explicitly
  asks. The AI upload-verification agent is a later phase; until it exists,
  every upload stays in the admin review queue and nothing user-uploaded is
  served publicly until an admin approves it.

## Tech stack & layout

- **Next.js (App Router) + TypeScript + Tailwind.** Server Components by
  default; add `"use client"` only where interactivity requires it.
- **Supabase** for Postgres, Auth, and Storage.
- Path alias `@/*` → `src/*`.
- SQL migrations live in `supabase/migrations/`, ordered by filename.
- Pinned to patched, audited dependency versions (`npm audit` must be clean).

## Security rules (non-negotiable)

1. **Secrets** live in `.env` files (gitignored). Only browser-safe values may
   carry the `NEXT_PUBLIC_` prefix. The Supabase **service-role key is
   server-only** and must never reach a client bundle.
2. **RLS is enabled on every table**, default-deny. UI checks are convenience
   only — the database is the security boundary. Ownership and role checks live
   in SQL policies (e.g. via a `public.is_admin()` helper).
3. **Accounts are decoupled from login methods.** `public.profiles` is the
   canonical account. `public.auth_identities` links external identities to a
   profile so a new provider (SSI/OIDC) attaches without a refactor. Login
   providers are registered in `src/lib/auth/providers/` behind one interface —
   adding a provider means adding a file, not editing call sites.
4. **Security headers + CSP.** Static headers in `next.config.mjs`; a strict,
   **nonce-based** `Content-Security-Policy` is set per request in
   `middleware.ts`. No `'unsafe-inline'` for scripts.
5. **File uploads** must: enforce an extension allowlist **and** verify the file
   **magic bytes** (never trust the client MIME), cap the size, generate a
   **random server-side object key** (never use the client filename in the path
   — no path traversal), store in a **private** Storage bucket (signed URLs
   only), and land in the **admin review queue** as `pending`.
6. **Server-side document generation sanitizes all user content.** PDFs/DOCX are
   built **programmatically from structured data** (no HTML rendering), and
   every user string passes through `sanitizeText()` before being written.
7. **Trust nothing from the client.** Validate and normalize all input on the
   server; never trust client-supplied ids, roles, or ownership claims.

## Workflow conventions

- Keep changes small and reviewable: one logical concern per commit.
- Run `npm run typecheck` and `npm run build` before considering work done.
- Branch for development; never push secrets.
