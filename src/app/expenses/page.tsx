'use client';

import { useExpenseContext } from '@/context/ExpenseContext';
import { ExpenseList, ExpenseFilters } from '@/components/expenses';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { downloadCSV } from '@/lib/utils';

export default function ExpensesPage() {
  const {
    filteredExpenses,
    filters,
    isLoading,
    updateFilters,
    resetFilters,
    updateExpense,
    deleteExpense,
    deleteExpenses,
    filteredSummary,
  } = useExpenseContext();
  const { showToast } = useToast();

  const handleDelete = (id: string) => {
    deleteExpense(id);
    showToast('Expense deleted successfully');
  };

  const handleDeleteMultiple = (ids: string[]) => {
    deleteExpenses(ids);
    showToast(`${ids.length} expense${ids.length !== 1 ? 's' : ''} deleted successfully`);
  };

  const handleEdit = (id: string, data: Parameters<typeof updateExpense>[1]) => {
    updateExpense(id, data);
    showToast('Expense updated successfully');
  };

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      showToast('No expenses to export', 'info');
      return;
    }
    downloadCSV(filteredExpenses);
    showToast(`Exported ${filteredExpenses.length} expenses to CSV`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">View and manage all your expenses</p>
        </div>
        <Button onClick={handleExport} variant="secondary">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </Button>
      </div>

      <Card>
        <ExpenseFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={resetFilters}
        />
      </Card>

      <Card>
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          totalAmount={filteredSummary.totalSpending}
        />
      </Card>
    </div>
  );
}
