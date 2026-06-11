import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs, CardLink, EmptyState, PageHeader } from "@/components/ui";
import { getSemester, getSubject, listExperiments } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth/session";
import { listManualsForSubject } from "@/lib/manuals";
import ManualUpload from "@/components/ManualUpload";
import ManualList from "@/components/ManualList";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();

  const [semester, experiments, user, manuals] = await Promise.all([
    getSemester(subject.semester_id),
    listExperiments(id),
    getCurrentUser(),
    listManualsForSubject(id),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          {
            label: semester
              ? semester.name || `Semester ${semester.number}`
              : "Semester",
            href: `/catalog/semesters/${subject.semester_id}`,
          },
          { label: subject.name },
        ]}
      />
      <PageHeader
        title={subject.name}
        subtitle={subject.code || undefined}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Experiments</h2>
        {experiments.length === 0 ? (
          <EmptyState>No experiments yet.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {experiments.map((e) => (
              <CardLink
                key={e.id}
                href={`/catalog/experiments/${e.id}`}
                title={`${e.number}. ${e.title}`}
                subtitle={e.description || undefined}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Lab Manuals</h2>
        <ManualList manuals={manuals} />
        {user ? (
          <ManualUpload subjectId={subject.id} />
        ) : (
          <p className="text-sm text-slate-500">
            <Link
              href={`/login?next=${encodeURIComponent(`/catalog/subjects/${subject.id}`)}`}
              className="underline"
            >
              Sign in
            </Link>{" "}
            to upload a lab manual.
          </p>
        )}
      </section>
    </main>
  );
}
