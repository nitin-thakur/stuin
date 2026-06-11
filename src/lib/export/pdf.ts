import PDFDocument from "pdfkit";
import type { ExportModel } from "./model";

/**
 * Render a lab document to a PDF buffer using pdfkit. Content is written as
 * plain text runs (built-in Helvetica/Courier fonts), so there is no markup
 * context and nothing user-supplied is interpreted as formatting.
 */
export function renderLabDocPdf(model: ExportModel): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new PDFDocument({ size: "A4", margin: 56 });
      const chunks: Buffer[] = [];
      pdf.on("data", (c: Buffer) => chunks.push(c));
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
      pdf.on("error", reject);

      // Title
      pdf.font("Helvetica-Bold").fontSize(18).text(model.title, { align: "left" });
      pdf.moveDown(0.3);

      // Meta
      pdf.font("Helvetica").fontSize(10).fillColor("#555555");
      for (const line of model.meta) pdf.text(line);
      pdf.fillColor("#000000");
      pdf.moveDown(0.8);

      // Sections
      for (const section of model.sections) {
        pdf.font("Helvetica-Bold").fontSize(13).text(section.heading);
        pdf.moveDown(0.2);
        const body = section.body.length > 0 ? section.body : "—";
        if (section.mono) {
          pdf.font("Courier").fontSize(9.5).text(body, { lineGap: 1 });
        } else {
          pdf.font("Helvetica").fontSize(11).text(body, { lineGap: 2 });
        }
        pdf.moveDown(0.8);
      }

      // Viva
      if (model.viva.length > 0) {
        pdf.font("Helvetica-Bold").fontSize(13).text("Viva Questions");
        pdf.moveDown(0.3);
        model.viva.forEach((v, i) => {
          pdf
            .font("Helvetica-Bold")
            .fontSize(11)
            .text(`Q${i + 1}. ${v.question}`);
          if (v.answer) {
            pdf.font("Helvetica").fontSize(11).text(v.answer, { lineGap: 2 });
          }
          pdf.moveDown(0.5);
        });
      }

      pdf.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
