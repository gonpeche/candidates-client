import { flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StatusFilterValue } from '@/components/filters/StatusFilter';
import { candidateColumns } from './utils/candidateColumns';
import { TableError } from './TableError';
import { TableSkeleton } from './TableSkeleton';
import { useTableData } from '@/hooks/useTableData';
import { TablePagination } from './TablePagination';

interface CandidateTableProps {
  statusFilter: StatusFilterValue;
  searchQuery: string;
}

export function CandidateTable({ statusFilter, searchQuery }: CandidateTableProps) {
  const { table, isLoading, isError, refetch } = useTableData(statusFilter, searchQuery);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <TableError onRetry={refetch} />;

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap text-center"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={candidateColumns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No candidates match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    row.index % 2 === 1 ? 'bg-muted/20 hover:bg-muted/40' : 'hover:bg-muted/30'
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} />
    </div>
  );
}
