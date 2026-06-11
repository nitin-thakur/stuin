import { createClient } from "@/lib/supabase/server";
import type { LabDocument } from "@/lib/types";

/** The current user's lab document for an experiment (RLS-scoped), or null. */
export async function getLabDocForExperiment(
  experimentId: string,
): Promise<LabDocument | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("lab_documents")
    .select("*")
    .eq("experiment_id", experimentId)
    .eq("author_id", user.id)
    .maybeSingle();

  return (data as LabDocument | null) ?? null;
}

/** A lab document by id. RLS ensures only the author (or an admin) can read. */
export async function getLabDocById(id: string): Promise<LabDocument | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as LabDocument | null) ?? null;
}
