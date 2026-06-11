"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveManual, rejectManual } from "@/app/manuals/actions";
import type { LabManual } from "@/lib/types";

export default function ReviewItem({ manual }: { manual: LabManual }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(kind: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      const res =
        kind === "approve"
          ? await approveManual(manual.id, note)
          : await rejectManual(manual.id, note);
      if (!res.ok) setError(res.error ?? "Action failed.");
      else router.refresh();
    } catch {
      setError("Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium">
            {manual.title || manual.original_filename}
          </div>
          <div className="text-xs text-slate-500">
            {manual.original_filename} · {(manual.size_bytes / 1024).toFixed(0)} KB
          </div>
        </div>
        <a
          href={`/manuals/${manual.id}/download`}
          className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Preview
        </a>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Review note (optional)"
        maxLength={1000}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => act("approve")}
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => act("reject")}
          className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </li>
  );
}
