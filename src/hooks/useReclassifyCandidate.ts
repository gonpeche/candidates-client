import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchCandidate } from "@/api/candidates";
import type { ReclassifyPayload } from "@/types";

export function useReclassifyCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReclassifyPayload }) =>
      patchCandidate(id, payload),
    onSuccess: (_, { payload }) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      if (payload.newReason) {
        queryClient.invalidateQueries({ queryKey: ["rejection-reasons"] });
      }
    },
  });
}
