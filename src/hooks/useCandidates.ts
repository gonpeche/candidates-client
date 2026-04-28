import { useQuery } from "@tanstack/react-query";
import { fetchCandidates } from "@/api/candidates";
import type { CandidateWithStatus } from "@/types";

export function useCandidates() {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: async (): Promise<CandidateWithStatus[]> => {
      const candidates = await fetchCandidates();
      return candidates.map((c) => ({
        ...c,
        status: c.reason === "" ? "approved" : "rejected",
      }));
    },
  });
}
