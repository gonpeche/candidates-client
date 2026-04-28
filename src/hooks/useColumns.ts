import { useQuery } from "@tanstack/react-query";
import { fetchColumns } from "@/api/columns";

export function useColumns() {
  return useQuery({
    queryKey: ["columns"],
    queryFn: fetchColumns,
  });
}
