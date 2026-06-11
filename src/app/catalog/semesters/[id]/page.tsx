import { notFound } from "next/navigation";
import { Breadcrumbs, CardLink, EmptyState, PageHeader } from "@/components/ui";
import { getBranch, getSemester, listSubjects } from "@/lib/catalog";

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const semester = await getSemester(id);
  if (!semester) notFound();

  const [branch, subjects] = await Promise.all([
    getBranch(semester.branch_id),
    listSubjects(id),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          {
            label: branch?.name ?? "Branch",
            href: `/catalog/branches/${semester.branch_id}`,
          },
          { label: semester.name || `Semester ${semester.number}` },
        ]}
      />
      <PageHeader
        title="Subjects"
        subtitle={semester.name || `Semester ${semester.number}`}
      />
      {subjects.length === 0 ? (
        <EmptyState>No subjects yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {subjects.map((s) => (
            <CardLink
              key={s.id}
              href={`/catalog/subjects/${s.id}`}
              title={s.name}
              subtitle={s.code || undefined}
            />
          ))}
        </div>
      )}
    </main>
  );
}
