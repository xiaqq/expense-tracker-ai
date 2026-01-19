'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { ExpenseFormData, CATEGORIES, Expense, CATEGORY_DESCRIPTIONS, Category } from '@/types/expense';
import { getTodayISO } from '@/lib/utils';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: Expense;
  isLoading?: boolean;
  submitLabel?: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
}

export function ExpenseForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = 'Add Expense',
}: ExpenseFormProps) {
  const getDefaultDescription = (category: Category) =>
    CATEGORY_DESCRIPTIONS[category];

  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount.toString() || '',
    category: initialData?.category || 'Groceries',
    description: initialData?.description || getDefaultDescription('Groceries'),
    date: initialData?.date || getTodayISO(),
    currency: initialData?.currency || 'CNY',
    currencySymbol: initialData?.currencySymbol || '¥',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        category: initialData.category,
        description: initialData.description,
        date: initialData.date,
        currency: initialData.currency || 'CNY',
        currencySymbol: initialData.currencySymbol || '¥',
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'amount':
        if (!value) return 'Amount is required';
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) return 'Amount must be a positive number';
        if (num > 999999.99) return 'Amount cannot exceed 999,999.99';
        return undefined;
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length > 200) return 'Description must be 200 characters or less';
        return undefined;
      case 'date':
        if (!value) return 'Date is required';
        const dateObj = new Date(value);
        if (isNaN(dateObj.getTime())) return 'Invalid date';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Auto-fill description when category changes
    if (name === 'category') {
      const newCategory = value as Category;
      setFormData((prev) => ({
        ...prev,
        category: newCategory,
        description: getDefaultDescription(newCategory),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      amount: validateField('amount', formData.amount),
      description: validateField('description', formData.description),
      date: validateField('date', formData.date),
    };

    setErrors(newErrors);
    setTouched({ amount: true, description: true, date: true });

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      if (!initialData) {
        // Reset form only for new expenses
        setFormData({
          amount: '',
          category: 'Groceries',
          description: getDefaultDescription('Groceries'),
          date: getTodayISO(),
          currency: 'CNY',
          currencySymbol: '¥',
        });
        setTouched({});
        setErrors({});
      }
    }
  };

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0.00"
          step="0.01"
          min="0"
          error={errors.amount}
        />
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoryOptions}
        />
      </div>

      <Input
        label="Description"
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="What did you spend on?"
        error={errors.description}
      />

      <Input
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.date}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
