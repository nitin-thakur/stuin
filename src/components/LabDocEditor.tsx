"use client";

import { useState } from "react";
import { saveLabDocument } from "@/app/lab-docs/actions";
import type { LabDocument, VivaItem } from "@/lib/types";

const FIELDS: {
  key: keyof EditableState;
  label: string;
  rows: number;
  mono?: boolean;
}[] = [
  { key: "aim", label: "Aim", rows: 3 },
  { key: "apparatus", label: "Apparatus / Software", rows: 3 },
  { key: "theory", label: "Theory", rows: 6 },
  { key: "procedure", label: "Procedure", rows: 6 },
  { key: "code", label: "Code", rows: 10, mono: true },
  { key: "observations", label: "Observations", rows: 5 },
  { key: "output", label: "Output", rows: 5, mono: true },
  { key: "result", label: "Result", rows: 3 },
];

interface EditableState {
  title: string;
  aim: string;
  apparatus: string;
  theory: string;
  procedure: string;
  code: string;
  observations: string;
  output: string;
  result: string;
}

function initialState(doc: LabDocument | null): EditableState {
  return {
    title: doc?.title ?? "",
    aim: doc?.aim ?? "",
    apparatus: doc?.apparatus ?? "",
    theory: doc?.theory ?? "",
    procedure: doc?.procedure ?? "",
    code: doc?.code ?? "",
    observations: doc?.observations ?? "",
    output: doc?.output ?? "",
    result: doc?.result ?? "",
  };
}

export default function LabDocEditor({
  experimentId,
  initial,
}: {
  experimentId: string;
  initial: LabDocument | null;
}) {
  const [state, setState] = useState<EditableState>(initialState(initial));
  const [viva, setViva] = useState<VivaItem[]>(initial?.viva ?? []);
  const [status, setStatus] = useState<"draft" | "final">(
    initial?.status ?? "draft",
  );
  const [docId, setDocId] = useState<string | null>(initial?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  function update(key: keyof EditableState, value: string) {
    setState((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }

  function updateViva(i: number, patch: Partial<VivaItem>) {
    setViva((list) => list.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveLabDocument(experimentId, {
        ...state,
        viva,
        status,
      });
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
      } else {
        setDocId(res.id ?? docId);
        setDirty(false);
        setMessage("Saved.");
      }
    } catch {
      setError("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const canExport = docId !== null && !dirty;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Title</label>
        <input
          value={state.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Implementing a singly linked list"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-sm font-medium">{f.label}</label>
          <textarea
            value={state[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            rows={f.rows}
            className={`rounded-md border border-slate-300 px-3 py-2 ${
              f.mono ? "font-mono text-sm" : ""
            }`}
          />
        </div>
      ))}

      {/* Viva questions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Viva Questions</label>
          <button
            type="button"
            onClick={() => {
              setViva((l) => [...l, { question: "", answer: "" }]);
              setDirty(true);
            }}
            className="text-sm text-slate-600 underline"
          >
            + Add question
          </button>
        </div>
        {viva.length === 0 && (
          <p className="text-sm text-slate-400">No viva questions yet.</p>
        )}
        {viva.map((v, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-md border border-slate-200 p-3"
          >
            <input
              value={v.question}
              onChange={(e) => updateViva(i, { question: e.target.value })}
              placeholder={`Question ${i + 1}`}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <textarea
              value={v.answer}
              onChange={(e) => updateViva(i, { answer: e.target.value })}
              placeholder="Answer"
              rows={2}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={() => {
                setViva((l) => l.filter((_, idx) => idx !== i));
                setDirty(true);
              }}
              className="self-start text-sm text-red-600 underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Status + actions */}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4">
        <label className="flex items-center gap-2 text-sm">
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "draft" | "final");
              setDirty(true);
            }}
            className="rounded-md border border-slate-300 px-2 py-1"
          >
            <option value="draft">Draft</option>
            <option value="final">Final</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <div className="flex items-center gap-2">
          <a
            href={canExport ? `/lab-docs/${docId}/export/pdf` : undefined}
            aria-disabled={!canExport}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              canExport
                ? "border-slate-300 hover:bg-slate-50"
                : "pointer-events-none border-slate-200 text-slate-300"
            }`}
          >
            Export PDF
          </a>
          <a
            href={canExport ? `/lab-docs/${docId}/export/docx` : undefined}
            aria-disabled={!canExport}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              canExport
                ? "border-slate-300 hover:bg-slate-50"
                : "pointer-events-none border-slate-200 text-slate-300"
            }`}
          >
            Export DOCX
          </a>
        </div>
      </div>

      {dirty && docId && (
        <p className="text-sm text-amber-600">
          You have unsaved changes — save before exporting.
        </p>
      )}
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
