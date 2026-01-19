'use client';

import { Input, Select, Button } from '@/components/ui';
import { ExpenseFilters as FiltersType, CATEGORIES } from '@/types/expense';

interface ExpenseFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: Partial<FiltersType>) => void;
  onReset: () => void;
}

export function ExpenseFilters({
  filters,
  onFilterChange,
  onReset,
}: ExpenseFiltersProps) {
  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.startDate ||
    filters.endDate ||
    filters.searchQuery;

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search expenses..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          value={filters.category}
          onChange={(e) =>
            onFilterChange({ category: e.target.value as FiltersType['category'] })
          }
          options={categoryOptions}
        />
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
          placeholder="Start date"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
          placeholder="End date"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
