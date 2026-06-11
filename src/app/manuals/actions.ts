"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { sanitizeText } from "@/lib/sanitize";
import { validateUpload, generateObjectKey } from "@/lib/upload";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Upload a lab manual. Validates content (allowlist + magic bytes + size),
 * stores it under a random key in the PRIVATE bucket, and records a metadata
 * row as 'pending' — it goes straight to the admin review queue and is not
 * visible to others until approved.
 */
export async function uploadManual(
  subjectId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Confirm the subject exists (RLS-readable catalog).
  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .maybeSingle();
  if (!subject) return { ok: false, error: "Subject not found." };

  const file = formData.get("file");
  const validated = await validateUpload(file instanceof File ? file : null);
  if (!validated.ok) return { ok: false, error: validated.error };

  const title =
    sanitizeText(formData.get("title"), { maxLength: 200, singleLine: true }) ||
    validated.value.displayName;

  const objectKey = generateObjectKey(subjectId, validated.value.ext);

  // Upload bytes with the service-role client (the bucket has no public access).
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(serverEnv.uploadBucket)
    .upload(objectKey, validated.value.buffer, {
      contentType: validated.value.mime,
      upsert: false,
    });
  if (uploadError) return { ok: false, error: "Upload failed." };

  // Record metadata as the user (RLS forces uploaded_by = self, status pending).
  const { error: insertError } = await supabase.from("lab_manuals").insert({
    subject_id: subjectId,
    uploaded_by: user.id,
    title,
    object_key: objectKey,
    original_filename: validated.value.displayName,
    mime_type: validated.value.mime,
    size_bytes: validated.value.size,
    sha256: validated.value.sha256,
    status: "pending",
  });

  if (insertError) {
    // Roll back the orphaned object so storage doesn't drift from the table.
    await admin.storage.from(serverEnv.uploadBucket).remove([objectKey]);
    return { ok: false, error: "Could not save the upload." };
  }

  revalidatePath(`/catalog/subjects/${subjectId}`);
  return { ok: true };
}

async function moderate(
  manualId: string,
  action: "approved" | "rejected",
  note: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const cleanNote = sanitizeText(note, { maxLength: 1000 });

  // RLS permits these writes only when the caller is an admin.
  const { data: updated, error: updateError } = await supabase
    .from("lab_manuals")
    .update({
      status: action,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: cleanNote || null,
    })
    .eq("id", manualId)
    .select("id, subject_id")
    .maybeSingle();

  if (updateError || !updated) {
    return { ok: false, error: "Not authorized or manual not found." };
  }

  await supabase.from("manual_review_events").insert({
    manual_id: manualId,
    reviewer_id: user.id,
    action,
    note: cleanNote || null,
  });

  revalidatePath("/admin/review");
  revalidatePath(`/catalog/subjects/${(updated as { subject_id: string }).subject_id}`);
  return { ok: true };
}

export async function approveManual(
  id: string,
  note: string,
): Promise<ActionResult> {
  return moderate(id, "approved", note);
}

export async function rejectManual(
  id: string,
  note: string,
): Promise<ActionResult> {
  return moderate(id, "rejected", note);
}
