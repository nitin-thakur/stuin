"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText, sanitizeViva } from "@/lib/sanitize";

export interface SaveResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Create or update the current user's lab document for an experiment.
 * All text is sanitized server-side; RLS guarantees the row is the caller's.
 */
export async function saveLabDocument(
  experimentId: string,
  raw: Record<string, unknown>,
): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Confirm the experiment exists (avoids dangling rows on bad ids).
  const { data: experiment } = await supabase
    .from("experiments")
    .select("id")
    .eq("id", experimentId)
    .maybeSingle();
  if (!experiment) return { ok: false, error: "Experiment not found." };

  const status = raw.status === "final" ? "final" : "draft";

  const payload = {
    experiment_id: experimentId,
    author_id: user.id,
    title: sanitizeText(raw.title, { maxLength: 300, singleLine: true }),
    aim: sanitizeText(raw.aim, { maxLength: 4000 }),
    apparatus: sanitizeText(raw.apparatus, { maxLength: 4000 }),
    theory: sanitizeText(raw.theory, { maxLength: 20000 }),
    procedure: sanitizeText(raw.procedure, { maxLength: 20000 }),
    code: sanitizeText(raw.code, { maxLength: 40000 }),
    observations: sanitizeText(raw.observations, { maxLength: 20000 }),
    output: sanitizeText(raw.output, { maxLength: 20000 }),
    result: sanitizeText(raw.result, { maxLength: 8000 }),
    viva: sanitizeViva(raw.viva),
    status,
  };

  const { data, error } = await supabase
    .from("lab_documents")
    .upsert(payload, { onConflict: "experiment_id,author_id" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/lab-docs/experiment/${experimentId}`);
  return { ok: true, id: (data as { id: string }).id };
}
