import { createClient } from "@/lib/supabase/server";
import type { LabManual } from "@/lib/types";

/**
 * Manuals a signed-in user may see for a subject: approved ones, plus their own
 * uploads in any state. RLS enforces this — the query just scopes by subject.
 */
export async function listManualsForSubject(
  subjectId: string,
): Promise<LabManual[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_manuals")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });
  return (data as LabManual[]) ?? [];
}

export async function getManualById(id: string): Promise<LabManual | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_manuals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as LabManual | null) ?? null;
}

/** Pending uploads for the admin review queue (RLS restricts to admins). */
export async function listPendingManuals(): Promise<LabManual[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_manuals")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data as LabManual[]) ?? [];
}
