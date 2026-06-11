import { Breadcrumbs, CardLink, EmptyState, PageHeader } from "@/components/ui";
import { listUniversities } from "@/lib/catalog";

export const metadata = { title: "Catalog — stuin" };

export default async function CatalogPage() {
  const universities = await listUniversities();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <Breadcrumbs items={[{ label: "Catalog" }]} />
      <PageHeader title="Universities" subtitle="Pick your university to begin." />
      {universities.length === 0 ? (
        <EmptyState>No universities yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {universities.map((u) => (
            <CardLink
              key={u.id}
              href={`/catalog/universities/${u.id}`}
              title={u.name}
            />
          ))}
        </div>
      )}
    </main>
  );
}
