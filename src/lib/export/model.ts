import type { Experiment, LabDocument } from "@/lib/types";
import { sanitizeText, sanitizeViva } from "@/lib/sanitize";

export interface ExportSection {
  heading: string;
  body: string;
  /** Render in a monospaced font (for code / output). */
  mono?: boolean;
}

export interface ExportModel {
  title: string;
  meta: string[];
  sections: ExportSection[];
  viva: { question: string; answer: string }[];
}

/**
 * Build a fully-sanitized, presentation-agnostic model from a stored lab
 * document. Both the PDF and DOCX generators render from this, so sanitization
 * happens exactly once, in one place.
 */
export function buildExportModel(
  doc: LabDocument,
  experiment: Experiment | null,
): ExportModel {
  const title =
    sanitizeText(doc.title, { maxLength: 300, singleLine: true }) ||
    (experiment
      ? sanitizeText(`Experiment ${experiment.number}: ${experiment.title}`, {
          singleLine: true,
        })
      : "Lab Practical");

  const meta: string[] = [];
  if (experiment) {
    meta.push(
      sanitizeText(`Experiment ${experiment.number}: ${experiment.title}`, {
        singleLine: true,
      }),
    );
  }
  meta.push(`Status: ${doc.status === "final" ? "Final" : "Draft"}`);

  const sections: ExportSection[] = [
    { heading: "Aim", body: sanitizeText(doc.aim) },
    { heading: "Apparatus / Software", body: sanitizeText(doc.apparatus) },
    { heading: "Theory", body: sanitizeText(doc.theory) },
    { heading: "Procedure", body: sanitizeText(doc.procedure) },
    { heading: "Code", body: sanitizeText(doc.code, { maxLength: 40000 }), mono: true },
    { heading: "Observations", body: sanitizeText(doc.observations) },
    { heading: "Output", body: sanitizeText(doc.output), mono: true },
    { heading: "Result", body: sanitizeText(doc.result) },
  ];

  return {
    title,
    meta,
    sections,
    viva: sanitizeViva(doc.viva),
  };
}

/** A filesystem-safe base filename derived from the (sanitized) title. */
export function exportFilename(model: ExportModel, ext: string): string {
  const base =
    model.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "lab-document";
  return `${base}.${ext}`;
}
