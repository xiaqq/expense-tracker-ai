'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui';
import { ExpenseSummary, CATEGORY_COLORS, CATEGORIES } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

interface SpendingChartsProps {
  summary: ExpenseSummary;
}

export function MonthlyTrendChart({ summary }: SpendingChartsProps) {
  const data = summary.monthlyTrend;

  if (data.every((d) => d.total === 0)) {
    return (
      <Card>
        <CardHeader title="Monthly Spending Trend" subtitle="Last 6 months" />
        <div className="h-64 flex items-center justify-center text-gray-500">
          No spending data available
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Monthly Spending Trend" subtitle="Last 6 months" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value) || 0, '¥'), 'Spending']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CategoryPieChart({ summary }: SpendingChartsProps) {
  const data = useMemo(() => {
    return CATEGORIES
      .map((category) => ({
        name: category,
        value: summary.categoryBreakdown[category],
        color: CATEGORY_COLORS[category],
      }))
      .filter((item) => item.value > 0);
  }, [summary.categoryBreakdown]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Spending by Category" subtitle="Category breakdown" />
        <div className="h-64 flex items-center justify-center text-gray-500">
          No spending data available
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Spending by Category" subtitle="Category breakdown" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value) || 0, '¥')}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CategoryBreakdown({ summary }: SpendingChartsProps) {
  const sortedCategories = useMemo(() => {
    return CATEGORIES
      .map((category) => ({
        category,
        amount: summary.categoryBreakdown[category],
        color: CATEGORY_COLORS[category],
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [summary.categoryBreakdown]);

  const totalSpending = summary.totalSpending;

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader title="Top Categories" subtitle="Where your money goes" />
      <div className="space-y-4">
        {sortedCategories.map(({ category, amount, color }) => {
          const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(amount, '¥')}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
