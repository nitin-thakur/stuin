import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv, serverEnv } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Bound to the request cookies, so queries run as the signed-in user under RLS.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookies are read-only. The
          // middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Privileged client using the service-role key. Bypasses RLS — use ONLY in
 * trusted server code after independently authorizing the action (e.g. after
 * confirming the caller is an admin). Never expose to the browser.
 */
export function createAdminClient(): SupabaseClient {
  return createServerClient(publicEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* no session persistence for the admin client */
      },
    },
  });
}
