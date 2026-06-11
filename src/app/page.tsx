import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight">stuin</h1>
      <p className="text-slate-600">
        A study platform for college students. Browse your university catalog,
        document your lab practicals, and export clean PDF/DOCX reports.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Sign in
        </Link>
        <Link
          href="/catalog"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Browse catalog
        </Link>
      </div>
    </main>
  );
}
