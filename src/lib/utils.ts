import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { Expense, ExpenseFilters, ExpenseSummary, Category, CATEGORIES } from '@/types/expense';

export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currencySymbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

export function formatDateShort(dateString: string): string {
  return format(parseISO(dateString), 'MMM d');
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMonthStartISO(): string {
  return format(startOfMonth(new Date()), 'yyyy-MM-dd');
}

export function getMonthEndISO(): string {
  return format(endOfMonth(new Date()), 'yyyy-MM-dd');
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] {
  return expenses.filter((expense) => {
    // Category filter
    if (filters.category !== 'All' && expense.category !== filters.category) {
      return false;
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const expenseDate = parseISO(expense.date);
      const start = parseISO(filters.startDate);
      const end = parseISO(filters.endDate);
      if (!isWithinInterval(expenseDate, { start, end })) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(query);
      const matchesCategory = expense.category.toLowerCase().includes(query);
      const matchesAmount = expense.amount.toString().includes(query);
      if (!matchesDescription && !matchesCategory && !matchesAmount) {
        return false;
      }
    }

    return true;
  });
}

export function calculateSummary(expenses: Expense[]): ExpenseSummary {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Total spending
  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Monthly spending
  const monthlyExpenses = expenses.filter((exp) => {
    const expDate = parseISO(exp.date);
    return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
  });
  const monthlySpending = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Average expense
  const averageExpense = expenses.length > 0 ? totalSpending / expenses.length : 0;

  // Category breakdown
  const categoryBreakdown = CATEGORIES.reduce((acc, category) => {
    acc[category] = expenses
      .filter((exp) => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return acc;
  }, {} as Record<Category, number>);

  // Monthly trend (last 6 months)
  const monthlyTrend: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);
    const monthTotal = expenses
      .filter((exp) => {
        const expDate = parseISO(exp.date);
        return isWithinInterval(expDate, { start: mStart, end: mEnd });
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    monthlyTrend.push({
      month: format(monthDate, 'MMM'),
      total: monthTotal,
    });
  }

  return {
    totalSpending,
    monthlySpending,
    averageExpense,
    expenseCount: expenses.length,
    categoryBreakdown,
    monthlyTrend,
  };
}

export function exportToCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map((exp) => [
    exp.date,
    exp.category,
    `"${exp.description.replace(/"/g, '""')}"`,
    exp.amount.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function downloadCSV(expenses: Expense[]): void {
  const csv = exportToCSV(expenses);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
