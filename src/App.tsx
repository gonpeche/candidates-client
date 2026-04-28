import { useState } from 'react';
import { CandidateTable } from '@/components/candidates/CandidateTable';
import { StatusFilter, type StatusFilterValue } from '@/components/filters/StatusFilter';
import { SearchInput } from '@/components/filters/SearchInput';
import { ColumnVisibilityFilter } from '@/components/filters/ColumnVisibilityFilter';

function App() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Emi — Candidate Screening</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <ColumnVisibilityFilter />
        </div>
        <CandidateTable statusFilter={statusFilter} searchQuery={searchQuery} />
      </div>
    </main>
  );
}

export default App;
