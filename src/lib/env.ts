/**
 * Centralized, validated access to environment variables.
 *
 * Reading `serverEnv.serviceRoleKey` from a client bundle throws — the
 * service-role key must never be shipped to the browser.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Values safe to expose to the browser. */
export const publicEnv = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Server-only secrets. Accessed lazily so the browser never evaluates them. */
export const serverEnv = {
  get serviceRoleKey(): string {
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
  get uploadBucket(): string {
    return process.env.SUPABASE_UPLOAD_BUCKET ?? "lab-manuals";
  },
};
