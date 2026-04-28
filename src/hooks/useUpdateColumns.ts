import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateColumns } from "@/api/columns";
import type { ColumnVisibilityMap } from "@/types";

export function useUpdateColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ColumnVisibilityMap) => updateColumns(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}
