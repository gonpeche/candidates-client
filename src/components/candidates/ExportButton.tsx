import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCandidates } from '@/hooks/useCandidates';
import { useColumns } from '@/hooks/useColumns';
import type { StatusFilterValue } from '@/components/filters/StatusFilter';
import type { CandidateWithStatus, ColumnVisibilityMap } from '@/types';

interface ExportButtonProps {
  statusFilter: StatusFilterValue;
  searchQuery: string;
}

function keyToHeader(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(
  candidates: CandidateWithStatus[],
  keys: (keyof CandidateWithStatus)[]
): string {
  const header = keys.map(keyToHeader).join(',');
  const rows = candidates.map((c) => keys.map((k) => escapeCell(c[k])).join(','));
  return [header, ...rows].join('\n');
}

function applyFilters(
  data: CandidateWithStatus[],
  statusFilter: StatusFilterValue,
  searchQuery: string
): CandidateWithStatus[] {
  const query = searchQuery.toLowerCase().trim();
  return data.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      !query || c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
}

export function ExportButton({ statusFilter, searchQuery }: ExportButtonProps) {
  const { data } = useCandidates();
  const { data: columns } = useColumns();

  function handleExport() {
    if (!data || !columns) return;
    const filtered = applyFilters(data, statusFilter, searchQuery);
    const keys: (keyof CandidateWithStatus)[] = [
      ...(Object.keys(columns) as (keyof ColumnVisibilityMap)[]),
      'status',
    ];
    const csv = toCSV(filtered, keys);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `candidates-${date}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data || !columns}
      aria-label="Export candidates to CSV"
      className="gap-1.5 whitespace-nowrap"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  );
}
