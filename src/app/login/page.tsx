import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Sign in — stuin" };

export default async function LoginPage() {
  // Already signed in? Skip the form.
  if (await getCurrentUser()) redirect("/catalog");

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-20">
      <div>
        <h1 className="text-2xl font-bold">Sign in to stuin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a login method to continue.
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
