import type { Metadata } from "next";
import { headers } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "stuin — study platform",
  description: "Study platform for college students.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Propagate the per-request CSP nonce set in middleware so Next can tag its
  // bootstrap scripts.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <head>{nonce ? <meta property="csp-nonce" nonce={nonce} /> : null}</head>
      <body className="min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
