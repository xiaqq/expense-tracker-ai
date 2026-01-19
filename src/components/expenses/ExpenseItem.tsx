'use client';

import { useState } from 'react';
import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ConfirmModal } from '@/components/ui';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export function ExpenseItem({
  expense,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: ExpenseItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-all group ${
          isSelected ? 'border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-200' : 'border-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          {showCheckbox && (
            <div onClick={handleCheckboxClick}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect?.(expense.id)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          )}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}20` }}
          >
            {CATEGORY_ICONS[expense.category]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{expense.description}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                  color: CATEGORY_COLORS[expense.category],
                }}
              >
                {expense.category}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(expense.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">
            {formatCurrency(expense.amount, expense.currencySymbol)}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Edit expense"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete expense"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(expense.id)}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expense.description}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
