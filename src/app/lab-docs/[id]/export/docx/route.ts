import { NextResponse } from "next/server";
import { getLabDocById } from "@/lib/lab-docs";
import { getExperiment } from "@/lib/catalog";
import { buildExportModel, exportFilename } from "@/lib/export/model";
import { renderLabDocDocx } from "@/lib/export/docx";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // RLS ensures only the author (or an admin) can read this document.
  const doc = await getLabDocById(id);
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const experiment = await getExperiment(doc.experiment_id);
  const model = buildExportModel(doc, experiment);
  const docx = await renderLabDocDocx(model);

  return new NextResponse(new Uint8Array(docx), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${exportFilename(model, "docx")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
