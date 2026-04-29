import { useCandidates } from "@/hooks/useCandidates";
import type { StatusFilterValue } from "@/components/filters/StatusFilter";
import type { CandidateWithStatus } from "@/types";

interface CandidateStatsProps {
  statusFilter: StatusFilterValue;
  searchQuery: string;
}

function applyFilters(
  data: CandidateWithStatus[],
  statusFilter: StatusFilterValue,
  searchQuery: string,
): CandidateWithStatus[] {
  const query = searchQuery.toLowerCase().trim();
  console.log(data);
  return data.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
}

export function CandidateStats({
  statusFilter,
  searchQuery,
}: CandidateStatsProps) {
  const { data, isLoading } = useCandidates();

  if (isLoading || !data) return <div className="h-5" />;

  const total = applyFilters(data, statusFilter, searchQuery).length;
  const approved = data.filter((c) => c.status === "approved").length;
  const rejected = data.filter((c) => c.status === "rejected").length;

  return (
    <p className="text-sm text-muted-foreground whitespace-nowrap">
      <span className="font-medium text-foreground">{total}</span>{" "}
      {total === 1 ? "candidate" : "candidates"}
      {" — "}
      <span className="font-medium text-green-600 dark:text-green-400">
        {approved}
      </span>{" "}
      approved
      {" · "}
      <span className="font-medium text-red-500">{rejected}</span> rejected
    </p>
  );
}
