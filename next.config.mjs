/**
 * Security-hardened Next.js config.
 *
 * Static security headers live here; the Content-Security-Policy is set
 * per-request in middleware.ts with a fresh nonce, because a static CSP would
 * force us to allow 'unsafe-inline' for scripts.
 */

const securityHeaders = [
  // Force HTTPS for two years, including subdomains.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Defense-in-depth clickjacking protection (CSP frame-ancestors is primary).
  { key: "X-Frame-Options", value: "DENY" },
  // Send only the origin on cross-origin navigation.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features by default.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
