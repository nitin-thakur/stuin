import type { AuthProvider } from "./types";

/** Email + password, backed by Supabase Auth. */
export const emailProvider: AuthProvider = {
  id: "email",
  label: "Email & password",
  kind: "password",
  enabled: true,
};
