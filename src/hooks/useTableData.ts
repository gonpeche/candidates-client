import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useColumnVisibility } from '@/hooks/useColumnVisibility';
import { useCandidates } from '@/hooks/useCandidates';
import type { StatusFilterValue } from '@/components/filters/StatusFilter';
import type { CandidateWithStatus } from '@/types';
import { candidateColumns } from '@/components/candidates/utils/candidateColumns';

const PAGE_SIZE = 15;

function filterCandidates(
  data: CandidateWithStatus[] | undefined,
  statusFilter: StatusFilterValue,
  searchQuery: string
): CandidateWithStatus[] {
  if (!data) return [];
  const query = searchQuery.toLowerCase().trim();
  return data.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      !query || c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
}

export function useTableData(statusFilter: StatusFilterValue, searchQuery: string) {
  const { data, isLoading, isError, refetch } = useCandidates();
  const { columnVisibility } = useColumnVisibility();
  const [sorting, setSorting] = useState<SortingState>([]);

  const candidates = useMemo(
    () => filterCandidates(data, statusFilter, searchQuery),
    [data, statusFilter, searchQuery]
  );

  const table = useReactTable({
    data: candidates,
    columns: candidateColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: { enableSorting: false },
    initialState: { pagination: { pageSize: PAGE_SIZE, pageIndex: 0 } },
    state: { columnVisibility, sorting },
    onSortingChange: setSorting,
  });

  return { table, isLoading, isError, refetch };
}
