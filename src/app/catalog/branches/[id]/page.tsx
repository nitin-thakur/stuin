import { notFound } from "next/navigation";
import { Breadcrumbs, CardLink, EmptyState, PageHeader } from "@/components/ui";
import { getBranch, getUniversity, listSemesters } from "@/lib/catalog";

export default async function BranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branch = await getBranch(id);
  if (!branch) notFound();

  const [university, semesters] = await Promise.all([
    getUniversity(branch.university_id),
    listSemesters(id),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          {
            label: university?.name ?? "University",
            href: `/catalog/universities/${branch.university_id}`,
          },
          { label: branch.name },
        ]}
      />
      <PageHeader title="Semesters" subtitle={branch.name} />
      {semesters.length === 0 ? (
        <EmptyState>No semesters yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {semesters.map((s) => (
            <CardLink
              key={s.id}
              href={`/catalog/semesters/${s.id}`}
              title={s.name || `Semester ${s.number}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
