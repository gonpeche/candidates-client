import { API_BASE_URL } from "@/constants/api";
import type { Candidate, ReclassifyPayload } from "@/types";

export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch(`${API_BASE_URL}/candidates`);
  if (!res.ok) throw new Error("Failed to fetch candidates");
  return res.json();
}

export async function patchCandidate(
  id: string,
  payload: ReclassifyPayload
): Promise<Candidate> {
  const res = await fetch(`${API_BASE_URL}/candidates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to reclassify candidate");
  return res.json();
}
