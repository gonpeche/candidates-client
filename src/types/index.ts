export interface Candidate {
  id: string;
  name: string;
  document: number;
  cv_zonajobs: string;
  cv_bumeran: string;
  phone: string;
  email: string;
  date: string;
  age: number;
  has_university: string;
  career: string;
  graduated: string;
  courses_approved: string;
  location: string;
  accepts_working_hours: string;
  desired_salary: string;
  had_interview: string;
  reason: string;
}

export type ColumnVisibilityMap = Record<keyof Candidate, boolean>;

export type CandidateStatus = "approved" | "rejected";

export type CandidateWithStatus = Candidate & { status: CandidateStatus };

export interface ReclassifyPayload {
  reasons: string[];
  newReason?: string;
}

export interface RejectionReasonsResponse {
  reasons: string[];
}
