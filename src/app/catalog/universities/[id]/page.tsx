import { notFound } from "next/navigation";
import { Breadcrumbs, CardLink, EmptyState, PageHeader } from "@/components/ui";
import { getUniversity, listBranches } from "@/lib/catalog";

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const university = await getUniversity(id);
  if (!university) notFound();

  const branches = await listBranches(id);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          { label: university.name },
        ]}
      />
      <PageHeader title="Branches" subtitle={university.name} />
      {branches.length === 0 ? (
        <EmptyState>No branches yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {branches.map((b) => (
            <CardLink
              key={b.id}
              href={`/catalog/branches/${b.id}`}
              title={b.name}
            />
          ))}
        </div>
      )}
    </main>
  );
}
