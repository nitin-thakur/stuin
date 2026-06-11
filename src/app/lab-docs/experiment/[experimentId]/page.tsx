import { redirect, notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import LabDocEditor from "@/components/LabDocEditor";
import { getCurrentUser } from "@/lib/auth/session";
import { getExperiment, getSubject } from "@/lib/catalog";
import { getLabDocForExperiment } from "@/lib/lab-docs";

export default async function LabDocPage({
  params,
}: {
  params: Promise<{ experimentId: string }>;
}) {
  const { experimentId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/lab-docs/experiment/${experimentId}`)}`,
    );
  }

  const experiment = await getExperiment(experimentId);
  if (!experiment) notFound();

  const [subject, doc] = await Promise.all([
    getSubject(experiment.subject_id),
    getLabDocForExperiment(experimentId),
  ]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          {
            label: subject?.name ?? "Subject",
            href: `/catalog/subjects/${experiment.subject_id}`,
          },
          {
            label: experiment.title,
            href: `/catalog/experiments/${experiment.id}`,
          },
          { label: "Documentation" },
        ]}
      />
      <PageHeader
        title="Lab Practical Documentation"
        subtitle={`Experiment ${experiment.number}: ${experiment.title}`}
      />
      <LabDocEditor experimentId={experimentId} initial={doc} />
    </main>
  );
}
