import type { AuthProvider } from "./types";
import { emailProvider } from "./email";
import { googleProvider } from "./google";

// To add a provider (e.g. SSI/OIDC): create a descriptor file and add it here.
const registry: AuthProvider[] = [emailProvider, googleProvider];

/** Enabled providers, for rendering the login UI. */
export const authProviders: AuthProvider[] = registry.filter((p) => p.enabled);

export function getProvider(id: string): AuthProvider | undefined {
  return authProviders.find((p) => p.id === id);
}

export const oauthProviders = authProviders.filter((p) => p.kind === "oauth");
export const passwordProviderEnabled = authProviders.some(
  (p) => p.kind === "password",
);

export type { AuthProvider } from "./types";
