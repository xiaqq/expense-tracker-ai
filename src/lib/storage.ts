import { Expense, Category } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-expenses';
const SEEDED_KEY = 'expense-tracker-seeded';

function generateSampleExpenses(): Expense[] {
  const now = new Date();
  const samples: { description: string; category: Category; amount: number; daysAgo: number }[] = [
    // This month
    { description: 'Grocery shopping at Whole Foods', category: 'Groceries', amount: 127.43, daysAgo: 1 },
    { description: 'Uber to airport', category: 'Transportation', amount: 45.00, daysAgo: 2 },
    { description: 'Netflix subscription', category: 'Entertainment', amount: 15.99, daysAgo: 3 },
    { description: 'Electric bill', category: 'Utilities', amount: 89.50, daysAgo: 5 },
    { description: 'Coffee and pastry at Starbucks', category: 'Dining Out', amount: 12.75, daysAgo: 6 },
    { description: 'New running shoes', category: 'Clothing & Personal Care', amount: 129.99, daysAgo: 7 },
    { description: 'Gas station fill-up', category: 'Transportation', amount: 52.30, daysAgo: 8 },
    { description: 'Movie tickets', category: 'Entertainment', amount: 28.00, daysAgo: 10 },
    { description: 'Lunch with colleagues', category: 'Dining Out', amount: 34.50, daysAgo: 12 },
    { description: 'Monthly rent', category: 'Housing', amount: 1500.00, daysAgo: 14 },
    // Last month
    { description: 'Phone bill', category: 'Utilities', amount: 75.00, daysAgo: 20 },
    { description: 'Dinner at Italian restaurant', category: 'Dining Out', amount: 78.25, daysAgo: 25 },
    { description: 'Spotify subscription', category: 'Entertainment', amount: 9.99, daysAgo: 28 },
    { description: 'Internet bill', category: 'Utilities', amount: 59.99, daysAgo: 30 },
    { description: 'Metro card reload', category: 'Transportation', amount: 50.00, daysAgo: 32 },
    { description: 'Gym membership', category: 'Entertainment', amount: 45.00, daysAgo: 35 },
    // Two months ago
    { description: 'Birthday gift for friend', category: 'Miscellaneous', amount: 55.00, daysAgo: 45 },
    { description: 'Concert tickets', category: 'Entertainment', amount: 120.00, daysAgo: 50 },
    { description: 'Weekly groceries', category: 'Groceries', amount: 95.60, daysAgo: 55 },
    { description: 'Car maintenance', category: 'Transportation', amount: 180.00, daysAgo: 60 },
    // Three months ago
    { description: 'Winter jacket', category: 'Clothing & Personal Care', amount: 199.00, daysAgo: 75 },
    { description: 'Restaurant takeout', category: 'Dining Out', amount: 42.30, daysAgo: 80 },
    { description: 'Haircut and grooming', category: 'Clothing & Personal Care', amount: 35.00, daysAgo: 85 },
    { description: 'Water and gas bill', category: 'Utilities', amount: 145.00, daysAgo: 90 },
    // Four months ago
    { description: 'Flight tickets to vacation', category: 'Travel', amount: 350.00, daysAgo: 105 },
    { description: 'Hotel booking', category: 'Travel', amount: 275.00, daysAgo: 110 },
    { description: 'Groceries', category: 'Groceries', amount: 88.45, daysAgo: 115 },
    { description: 'Home insurance', category: 'Housing', amount: 150.00, daysAgo: 120 },
    // Five months ago
    { description: 'Medical checkup copay', category: 'Miscellaneous', amount: 30.00, daysAgo: 140 },
    { description: 'Books and magazines', category: 'Miscellaneous', amount: 45.99, daysAgo: 150 },
    { description: 'Pizza delivery', category: 'Dining Out', amount: 32.00, daysAgo: 155 },
    { description: 'Car insurance', category: 'Transportation', amount: 200.00, daysAgo: 160 },
  ];

  return samples.map((sample, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - sample.daysAgo);
    const dateStr = date.toISOString().split('T')[0];
    const createdAt = date.toISOString();

    return {
      id: `sample-${index}-${Date.now()}`,
      description: sample.description,
      category: sample.category,
      amount: sample.amount,
      date: dateStr,
      currency: 'CNY',
      currencySymbol: '¥',
      createdAt,
      updatedAt: createdAt,
    };
  });
}

export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const seeded = localStorage.getItem(SEEDED_KEY);

    if (!data && !seeded) {
      // First time: seed with sample data
      const sampleExpenses = generateSampleExpenses();
      saveExpenses(sampleExpenses);
      localStorage.setItem(SEEDED_KEY, 'true');
      return sampleExpenses;
    }

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
