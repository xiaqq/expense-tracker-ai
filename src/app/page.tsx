'use client';

import { useExpenseContext } from '@/context/ExpenseContext';
import {
  SummaryCards,
  MonthlyTrendChart,
  CategoryPieChart,
  CategoryBreakdown,
  RecentExpenses,
} from '@/components/dashboard';

export default function Dashboard() {
  const { expenses, summary, isLoading } = useExpenseContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your spending at a glance</p>
      </div>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart summary={summary} />
        <CategoryPieChart summary={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown summary={summary} />
        <RecentExpenses expenses={expenses} />
      </div>
    </div>
  );
}
