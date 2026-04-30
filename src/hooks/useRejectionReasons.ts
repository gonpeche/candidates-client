import { useQuery } from "@tanstack/react-query";
import { fetchRejectionReasons } from "@/api/rejectionReasons";

export function useRejectionReasons() {
  return useQuery({
    queryKey: ["rejection-reasons"],
    queryFn: fetchRejectionReasons,
    staleTime: Infinity,
  });
}
