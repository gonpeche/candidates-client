import { useMemo } from 'react';
import { useColumns } from './useColumns';
import type { ColumnVisibilityMap } from '@/types';

interface UseColumnVisibilityResult {
  columnVisibility: Record<string, boolean>;
  isLoading: boolean;
}

function toTableVisibility(columns: Partial<ColumnVisibilityMap>): Record<string, boolean> {
  const { cv_zonajobs, cv_bumeran, ...rest } = columns as Record<string, boolean>;
  const cvVisible = cv_zonajobs !== false || cv_bumeran !== false;
  return { ...rest, cv: cvVisible };
}

export function useColumnVisibility(): UseColumnVisibilityResult {
  const { data: columns, isLoading } = useColumns();

  const columnVisibility = useMemo(() => (columns ? toTableVisibility(columns) : {}), [columns]);

  return { columnVisibility, isLoading };
}
