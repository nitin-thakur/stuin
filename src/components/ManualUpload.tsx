"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadManual } from "@/app/manuals/actions";

export default function ManualUpload({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await uploadManual(subjectId, fd);
      if (!res.ok) {
        setError(res.error ?? "Upload failed.");
      } else {
        setMessage("Uploaded. It will appear here once an admin approves it.");
        formRef.current?.reset();
        router.refresh();
      }
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4"
    >
      <p className="text-sm font-medium">Upload a lab manual (PDF, max 25 MiB)</p>
      <input
        type="text"
        name="title"
        placeholder="Title (optional)"
        maxLength={200}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="file"
        name="file"
        accept="application/pdf,.pdf"
        required
        className="text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Upload"}
      </button>
      <p className="text-xs text-slate-400">
        Every upload is reviewed by an admin before it becomes visible to others.
      </p>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
