import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-expenses';

export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return [];
    // Add default currency for old expenses without currency field
    const expenses: Expense[] = JSON.parse(data);
    return expenses.map(exp => ({
      ...exp,
      currency: exp.currency || 'CNY',
      currencySymbol: exp.currencySymbol || '¥',
    }));
  } catch {
    console.error('Failed to parse expenses from localStorage');
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    console.error('Failed to save expenses to localStorage');
  }
}

export function addExpense(expense: Expense): Expense[] {
  const expenses = getExpenses();
  const newExpenses = [expense, ...expenses];
  saveExpenses(newExpenses);
  return newExpenses;
}

export function updateExpense(updatedExpense: Expense): Expense[] {
  const expenses = getExpenses();
  const newExpenses = expenses.map((expense) =>
    expense.id === updatedExpense.id ? updatedExpense : expense
  );
  saveExpenses(newExpenses);
  return newExpenses;
}

export function deleteExpense(id: string): Expense[] {
  const expenses = getExpenses();
  const newExpenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses(newExpenses);
  return newExpenses;
}

export function deleteExpenses(ids: string[]): Expense[] {
  const expenses = getExpenses();
  const idSet = new Set(ids);
  const newExpenses = expenses.filter((expense) => !idSet.has(expense.id));
  saveExpenses(newExpenses);
  return newExpenses;
}

export function getExpenseById(id: string): Expense | undefined {
  const expenses = getExpenses();
  return expenses.find((expense) => expense.id === id);
}
