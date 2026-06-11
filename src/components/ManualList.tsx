import type { LabManual } from "@/lib/types";

function StatusBadge({ status }: { status: LabManual["status"] }) {
  const styles: Record<LabManual["status"], string> = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function ManualList({ manuals }: { manuals: LabManual[] }) {
  if (manuals.length === 0) {
    return (
      <p className="text-sm text-slate-400">No manuals available yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {manuals.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3"
        >
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900">
              {m.title || m.original_filename}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <StatusBadge status={m.status} />
              <span>{(m.size_bytes / 1024).toFixed(0)} KB</span>
            </div>
            {m.status === "rejected" && m.review_note && (
              <p className="mt-1 text-xs text-red-600">
                Rejected: {m.review_note}
              </p>
            )}
          </div>
          <a
            href={`/manuals/${m.id}/download`}
            className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
