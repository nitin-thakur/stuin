import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import type { ExportModel } from "./model";

/**
 * Render a lab document to a DOCX buffer using the `docx` library. Each value
 * is added as a plain TextRun, so user content is never interpreted as markup.
 */
export async function renderLabDocDocx(model: ExportModel): Promise<Buffer> {
  // Split multi-line bodies into one paragraph per line to preserve breaks.
  const bodyParagraphs = (text: string, mono: boolean): Paragraph[] => {
    const value = text.length > 0 ? text : "—";
    return value.split("\n").map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: mono ? "Courier New" : undefined,
              size: mono ? 19 : undefined, // half-points (~9.5pt)
            }),
          ],
        }),
    );
  };

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({ text: model.title, heading: HeadingLevel.TITLE }),
  );
  for (const line of model.meta) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: line, italics: true, color: "555555" })],
      }),
    );
  }

  for (const section of model.sections) {
    children.push(
      new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_2 }),
    );
    children.push(...bodyParagraphs(section.body, !!section.mono));
  }

  if (model.viva.length > 0) {
    children.push(
      new Paragraph({ text: "Viva Questions", heading: HeadingLevel.HEADING_2 }),
    );
    model.viva.forEach((v, i) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Q${i + 1}. ${v.question}`, bold: true }),
          ],
        }),
      );
      if (v.answer) children.push(...bodyParagraphs(v.answer, false));
    });
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
