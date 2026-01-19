'use client';

import { useState } from 'react';
import { Expense, ExpenseFormData } from '@/types/expense';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseForm } from './ExpenseForm';
import { Modal, Button, ConfirmModal } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (id: string, data: ExpenseFormData) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  totalAmount?: number;
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onDeleteMultiple,
  totalAmount,
}: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleEditSubmit = (data: ExpenseFormData) => {
    if (editingExpense) {
      onEdit(editingExpense.id, data);
      setEditingExpense(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map((e) => e.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (onDeleteMultiple && selectedIds.size > 0) {
      onDeleteMultiple(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected = expenses.length > 0 && selectedIds.size === expenses.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < expenses.length;

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
        <p className="text-gray-500">
          Start tracking your expenses by adding your first one.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Selection toolbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : 'Select all'}
            </span>
          </label>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
            >
              Clear
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkDeleteModal(true)}
            >
              <svg
                className="w-4 h-4 mr-1"
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
              Delete ({selectedIds.size})
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onEdit={setEditingExpense}
            onDelete={onDelete}
            isSelected={selectedIds.has(expense.id)}
            onSelect={handleSelectOne}
            showCheckbox={true}
          />
        ))}
      </div>

      {totalAmount !== undefined && expenses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-gray-600">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </span>
          <span className="font-semibold text-gray-900">
            Total: {formatCurrency(totalAmount, '¥')}
          </span>
        </div>
      )}

      <Modal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onSubmit={handleEditSubmit}
            initialData={editingExpense}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Expenses"
        message={`Are you sure you want to delete ${selectedIds.size} expense${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
      />
    </>
  );
}
