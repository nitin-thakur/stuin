import { createClient } from "@/lib/supabase/server";
import type {
  University,
  Branch,
  Semester,
  Subject,
  Experiment,
} from "@/lib/types";

/**
 * Read helpers for the content hierarchy. All run under the caller's RLS
 * context; the catalog is public-readable, so these work for anon users too.
 */

export async function listUniversities(): Promise<University[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("universities")
    .select("*")
    .order("name");
  return (data as University[]) ?? [];
}

export async function getUniversity(id: string): Promise<University | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("universities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as University | null) ?? null;
}

export async function listBranches(universityId: string): Promise<Branch[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branches")
    .select("*")
    .eq("university_id", universityId)
    .order("name");
  return (data as Branch[]) ?? [];
}

export async function getBranch(id: string): Promise<Branch | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Branch | null) ?? null;
}

export async function listSemesters(branchId: string): Promise<Semester[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("semesters")
    .select("*")
    .eq("branch_id", branchId)
    .order("number");
  return (data as Semester[]) ?? [];
}

export async function getSemester(id: string): Promise<Semester | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("semesters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Semester | null) ?? null;
}

export async function listSubjects(semesterId: string): Promise<Subject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .eq("semester_id", semesterId)
    .order("name");
  return (data as Subject[]) ?? [];
}

export async function getSubject(id: string): Promise<Subject | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Subject | null) ?? null;
}

export async function listExperiments(subjectId: string): Promise<Experiment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiments")
    .select("*")
    .eq("subject_id", subjectId)
    .order("number");
  return (data as Experiment[]) ?? [];
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Experiment | null) ?? null;
}
