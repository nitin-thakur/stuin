/**
 * Input sanitization for user-supplied text.
 *
 * Exports are generated PROGRAMMATICALLY (pdfkit / docx) from plain strings, so
 * there is no HTML/markup context to inject into. This still normalizes and
 * strips control characters, and enforces length caps, as defense in depth and
 * to keep generated documents clean.
 */

const DEFAULT_MAX = 20000;

// Strip C0/C1 control chars except tab (U+0009), newline (U+000A), carriage
// return (U+000D). Built from escapes so no literal control byte is in source.
const CONTROL_CHARS = new RegExp(
  "[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]",
  "g",
);

export function sanitizeText(
  input: unknown,
  opts: { maxLength?: number; singleLine?: boolean } = {},
): string {
  if (input === null || input === undefined) return "";
  let s = typeof input === "string" ? input : String(input);

  s = s.normalize("NFC");
  s = s.replace(/\r\n?/g, "\n"); // normalize line endings
  s = s.replace(CONTROL_CHARS, ""); // strip control chars

  if (opts.singleLine) s = s.replace(/\n+/g, " ");

  const max = opts.maxLength ?? DEFAULT_MAX;
  if (s.length > max) s = s.slice(0, max);

  return s.trim();
}

export interface CleanViva {
  question: string;
  answer: string;
}

/** Sanitize the viva list, dropping empty entries and capping the count. */
export function sanitizeViva(input: unknown): CleanViva[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 100)
    .map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        question: sanitizeText(obj.question, { maxLength: 2000 }),
        answer: sanitizeText(obj.answer, { maxLength: 4000 }),
      };
    })
    .filter((v) => v.question.length > 0 || v.answer.length > 0);
}
