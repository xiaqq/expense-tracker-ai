'use client';

import { useRouter } from 'next/navigation';
import { useExpenseContext } from '@/context/ExpenseContext';
import { ExpenseForm } from '@/components/expenses';
import { Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { ExpenseFormData } from '@/types/expense';

export default function NewExpensePage() {
  const router = useRouter();
  const { addExpense } = useExpenseContext();
  const { showToast } = useToast();

  const handleSubmit = (data: ExpenseFormData) => {
    addExpense(data);
    showToast('Expense added successfully');
    router.push('/expenses');
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-gray-500 mt-1">Record a new expense</p>
      </div>

      <Card>
        <ExpenseForm onSubmit={handleSubmit} submitLabel="Add Expense" />
      </Card>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  );
}
