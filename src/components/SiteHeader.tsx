import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold">
          stuin
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/catalog" className="text-slate-600 hover:text-slate-900">
            Catalog
          </Link>
          {profile?.role === "admin" && (
            <Link
              href="/admin/review"
              className="text-slate-600 hover:text-slate-900"
            >
              Review queue
            </Link>
          )}
          {profile ? (
            <SignOutButton />
          ) : (
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
