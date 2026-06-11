/**
 * Shared domain types mirroring the Postgres schema in supabase/migrations.
 * Hand-maintained (run `supabase gen types` to regenerate fuller types once a
 * project is linked).
 */

export type Role = "student" | "admin";

export interface Profile {
  id: string;
  display_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  name: string;
  slug: string;
}

export interface Branch {
  id: string;
  university_id: string;
  name: string;
  slug: string;
}

export interface Semester {
  id: string;
  branch_id: string;
  number: number;
  name: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  code: string;
  slug: string;
}

export interface Experiment {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  description: string;
}

export interface VivaItem {
  question: string;
  answer: string;
}

/** The structured Lab Practical Documentation template. */
export interface LabDocument {
  id: string;
  experiment_id: string;
  author_id: string;
  title: string;
  aim: string;
  apparatus: string;
  theory: string;
  procedure: string;
  code: string;
  observations: string;
  output: string;
  result: string;
  viva: VivaItem[];
  status: "draft" | "final";
  created_at: string;
  updated_at: string;
}

export type ManualStatus = "pending" | "approved" | "rejected";

export interface LabManual {
  id: string;
  subject_id: string;
  uploaded_by: string;
  title: string;
  object_key: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string | null;
  status: ManualStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}

/** The editable fields of the lab-doc template (everything the form owns). */
export type LabDocumentInput = Pick<
  LabDocument,
  | "title"
  | "aim"
  | "apparatus"
  | "theory"
  | "procedure"
  | "code"
  | "observations"
  | "output"
  | "result"
  | "viva"
  | "status"
>;
