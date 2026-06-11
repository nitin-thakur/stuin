import { redirect } from "next/navigation";
import { Breadcrumbs, EmptyState, PageHeader } from "@/components/ui";
import ReviewItem from "@/components/ReviewItem";
import { getCurrentProfile } from "@/lib/auth/session";
import { listPendingManuals } from "@/lib/manuals";

export const metadata = { title: "Review queue — stuin" };

export default async function AdminReviewPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/review");
  // Defense in depth — RLS already prevents non-admins from reading the queue.
  if (profile.role !== "admin") redirect("/");

  const pending = await listPendingManuals();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs items={[{ label: "Admin" }, { label: "Review queue" }]} />
      <PageHeader
        title="Upload review queue"
        subtitle="Approve or reject uploaded lab manuals."
      />
      {pending.length === 0 ? (
        <EmptyState>Nothing pending review.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((m) => (
            <ReviewItem key={m.id} manual={m} />
          ))}
        </ul>
      )}
    </main>
  );
}
