import { API_BASE_URL } from "@/constants/api";
import type { RejectionReasonsResponse } from "@/types";

export async function fetchRejectionReasons(): Promise<RejectionReasonsResponse> {
  const res = await fetch(`${API_BASE_URL}/rejection-reasons`);
  if (!res.ok) throw new Error("Failed to fetch rejection reasons");
  return res.json();
}
