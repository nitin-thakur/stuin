import { randomUUID, createHash } from "node:crypto";

/**
 * Secure file-upload controls (see CLAUDE.md rule 5).
 *
 * Phase 1 accepts PDF lab manuals only. We validate by extension allowlist AND
 * magic bytes, cap the size, and generate a random server-side object key so
 * the client filename never touches the storage path.
 */

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MiB

interface AllowedType {
  ext: string;
  mime: string;
  /** Leading magic-byte signature the file content must start with. */
  magic: number[];
}

const ALLOWED: AllowedType[] = [
  { ext: "pdf", mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
];

export interface ValidatedUpload {
  buffer: Buffer;
  mime: string;
  ext: string;
  size: number;
  sha256: string;
  /** Sanitized client filename — for display only, never used as a path. */
  displayName: string;
}

export type ValidationError = { ok: false; error: string };
export type ValidationOk = { ok: true; value: ValidatedUpload };

function startsWith(buf: Buffer, magic: number[]): boolean {
  if (buf.length < magic.length) return false;
  return magic.every((byte, i) => buf[i] === byte);
}

/** Keep a human-readable label only; strip anything path-like. */
export function safeDisplayName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return (
    base
      .replace(/[^A-Za-z0-9 ._-]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "file"
  );
}

export async function validateUpload(
  file: File | null,
): Promise<ValidationOk | ValidationError> {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { ok: false, error: "No file provided." };
  }
  if (file.size <= 0) return { ok: false, error: "Empty file." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File exceeds the 25 MiB limit." };
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const allowed = ALLOWED.find((a) => a.ext === ext);
  if (!allowed) {
    return { ok: false, error: "Only PDF files are allowed." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Re-check the size from actual bytes (don't trust the reported size).
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File exceeds the 25 MiB limit." };
  }

  // Verify content magic bytes — do NOT trust the client-supplied MIME type.
  if (!startsWith(buffer, allowed.magic)) {
    return { ok: false, error: "File content does not match a PDF." };
  }

  const sha256 = createHash("sha256").update(buffer).digest("hex");

  return {
    ok: true,
    value: {
      buffer,
      mime: allowed.mime,
      ext: allowed.ext,
      size: buffer.length,
      sha256,
      displayName: safeDisplayName(file.name),
    },
  };
}

/** Random, non-guessable storage key. Never includes the client filename. */
export function generateObjectKey(subjectId: string, ext: string): string {
  return `${subjectId}/${randomUUID()}.${ext}`;
}
