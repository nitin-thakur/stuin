/**
 * Pure redirect-safety helper, importable from both client and server code
 * (no server-only dependencies).
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/catalog";
  // Same-site absolute paths only; reject open-redirect attempts.
  if (!next.startsWith("/") || next.startsWith("//")) return "/catalog";
  return next;
}
