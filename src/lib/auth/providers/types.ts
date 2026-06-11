/**
 * One interface for every login method. Email/password and Google ship in
 * Phase 1; an SSI/OIDC provider is added later by dropping a new descriptor
 * into this folder and registering it in `index.ts` — no call sites change.
 */

export type AuthProviderKind = "password" | "oauth";

export interface AuthProvider {
  /** Stable id, also used as the value in `auth_identities.provider`. */
  id: string;
  /** Button label shown on the login screen. */
  label: string;
  kind: AuthProviderKind;
  /** Toggle without deleting the descriptor. */
  enabled: boolean;
  /**
   * For `kind: "oauth"`, the underlying Supabase OAuth provider name. A future
   * custom OIDC provider would instead carry its own issuer config here.
   */
  oauthProvider?: string;
}
