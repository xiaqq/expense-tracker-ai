'use client';

import Link from 'next/link';
import { Card, CardHeader, Button } from '@/components/ui';
import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/expense';
import { formatCurrency, formatDateShort } from '@/lib/utils';

interface RecentExpensesProps {
  expenses: Expense[];
  limit?: number;
}

export function RecentExpenses({ expenses, limit = 5 }: RecentExpensesProps) {
  const recentExpenses = expenses.slice(0, limit);

  return (
    <Card>
      <CardHeader
        title="Recent Expenses"
        subtitle="Latest transactions"
        action={
          expenses.length > 0 && (
            <Link href="/expenses">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          )
        }
      />
      {recentExpenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No expenses yet</p>
          <Link href="/expenses/new">
            <Button variant="primary" size="sm" className="mt-3">
              Add your first expense
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                  }}
                >
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateShort(expense.date)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(expense.amount, expense.currencySymbol)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
