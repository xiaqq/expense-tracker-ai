'use client';

import { Card } from '@/components/ui';
import { ExpenseSummary } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  summary: ExpenseSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(summary.totalSpending, '¥'),
      subtitle: `${summary.expenseCount} expenses`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'indigo',
    },
    {
      title: 'This Month',
      value: formatCurrency(summary.monthlySpending, '¥'),
      subtitle: 'Current month spending',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Average Expense',
      value: formatCurrency(summary.averageExpense, '¥'),
      subtitle: 'Per transaction',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: 'purple',
    },
  ];

  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              colorStyles[card.color as keyof typeof colorStyles].bg
            }`}
          >
            <span className={colorStyles[card.color as keyof typeof colorStyles].icon}>
              {card.icon}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400">{card.subtitle}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
