import type { AuthProvider } from "./types";

/** Google sign-in via Supabase OAuth. */
export const googleProvider: AuthProvider = {
  id: "google",
  label: "Continue with Google",
  kind: "oauth",
  enabled: true,
  oauthProvider: "google",
};
