import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { getExperiment, getSubject } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = await getExperiment(id);
  if (!experiment) notFound();

  const [subject, user] = await Promise.all([
    getSubject(experiment.subject_id),
    getCurrentUser(),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          {
            label: subject?.name ?? "Subject",
            href: `/catalog/subjects/${experiment.subject_id}`,
          },
          { label: experiment.title },
        ]}
      />
      <PageHeader
        title={`${experiment.number}. ${experiment.title}`}
        subtitle={subject?.name}
      />
      {experiment.description && (
        <p className="text-slate-600">{experiment.description}</p>
      )}

      <div className="rounded-lg border border-slate-200 p-4">
        <h2 className="font-semibold">Lab Practical Documentation</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill a structured write-up for this experiment and export it as PDF or
          DOCX.
        </p>
        <div className="mt-3">
          {user ? (
            <Link
              href={`/lab-docs/experiment/${experiment.id}`}
              className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Open my documentation
            </Link>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(`/lab-docs/experiment/${experiment.id}`)}`}
              className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Sign in to document this experiment
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
