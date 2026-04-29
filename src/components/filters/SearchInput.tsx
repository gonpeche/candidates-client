import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DEBOUNCE_MS = 400;

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  // Keep local state in sync when parent clears the value externally
  useEffect(() => {
    if (value === '') setInputValue('');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => onChange(inputValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue, onChange]);

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Search by name or email..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 pr-9 w-full sm:w-72"
        aria-label="Search candidates by name or email"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
