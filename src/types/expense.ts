export type Category =
  | 'Housing'
  | 'Utilities'
  | 'Groceries'
  | 'Transportation'
  | 'Dining Out'
  | 'Entertainment'
  | 'Travel'
  | 'Clothing & Personal Care'
  | 'Miscellaneous';

export const CATEGORIES: Category[] = [
  'Housing',
  'Utilities',
  'Groceries',
  'Transportation',
  'Dining Out',
  'Entertainment',
  'Travel',
  'Clothing & Personal Care',
  'Miscellaneous',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Housing: '#6366f1',           // Indigo
  Utilities: '#f59e0b',         // Amber
  Groceries: '#22c55e',         // Green
  Transportation: '#3b82f6',    // Blue
  'Dining Out': '#ef4444',      // Red
  Entertainment: '#a855f7',     // Purple
  Travel: '#06b6d4',            // Cyan
  'Clothing & Personal Care': '#ec4899', // Pink
  Miscellaneous: '#6b7280',     // Gray
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Housing: '🏠',
  Utilities: '💡',
  Groceries: '🛒',
  Transportation: '🚗',
  'Dining Out': '🍽️',
  Entertainment: '🎬',
  Travel: '✈️',
  'Clothing & Personal Care': '👔',
  Miscellaneous: '📦',
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Housing: 'Rent/mortgage, property tax, insurance, HOA fees',
  Utilities: 'Electricity, gas, water, internet, phone',
  Groceries: 'Food and household supplies',
  Transportation: 'Car payments, insurance, gas, maintenance, public transit',
  'Dining Out': 'Restaurants, bars, coffee shops',
  Entertainment: 'Movies, concerts, events, hobbies',
  Travel: 'Vacations, trips, accommodations',
  'Clothing & Personal Care': 'Clothes, shoes, haircuts, grooming, toiletries',
  Miscellaneous: 'Everything else not covered above',
};

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date string
  currency: string; // Currency code (USD, CNY, EUR)
  currencySymbol: string; // Currency symbol ($, ¥, €)
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  imageId?: string; // Reference to stored image in IndexedDB
}

export interface ExpenseFormData {
  amount: string;
  category: Category;
  description: string;
  date: string;
  currency?: string;
  currencySymbol?: string;
  scannedImage?: string; // Base64 image data to be saved
}

export interface ExpenseFilters {
  category: Category | 'All';
  startDate: string;
  endDate: string;
  searchQuery: string;
}

export interface ExpenseSummary {
  totalSpending: number;
  monthlySpending: number;
  averageExpense: number;
  expenseCount: number;
  categoryBreakdown: Record<Category, number>;
  monthlyTrend: { month: string; total: number }[];
}
