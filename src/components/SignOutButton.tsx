export default function SignOutButton() {
  // A plain POST form — no client JS needed, and not GET-triggerable.
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="text-sm text-slate-500 underline hover:text-slate-700"
      >
        Sign out
      </button>
    </form>
  );
}
