'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, ExpenseFormData, ExpenseFilters } from '@/types/expense';
import * as storage from '@/lib/storage';
import { filterExpenses, calculateSummary, getMonthStartISO, getMonthEndISO } from '@/lib/utils';

const defaultFilters: ExpenseFilters = {
  category: 'All',
  startDate: '',
  endDate: '',
  searchQuery: '',
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from localStorage on mount
  useEffect(() => {
    const loadedExpenses = storage.getExpenses();
    setExpenses(loadedExpenses);
    setIsLoading(false);
  }, []);

  const addExpense = useCallback((formData: ExpenseFormData) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      id: uuidv4(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      currency: formData.currency || 'CNY',
      currencySymbol: formData.currencySymbol || '¥',
      createdAt: now,
      updatedAt: now,
    };
    const newExpenses = storage.addExpense(newExpense);
    setExpenses(newExpenses);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, formData: ExpenseFormData) => {
    const existingExpense = expenses.find((e) => e.id === id);
    if (!existingExpense) return null;

    const updatedExpense: Expense = {
      ...existingExpense,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      currency: formData.currency || existingExpense.currency || 'CNY',
      currencySymbol: formData.currencySymbol || existingExpense.currencySymbol || '¥',
      updatedAt: new Date().toISOString(),
    };
    const newExpenses = storage.updateExpense(updatedExpense);
    setExpenses(newExpenses);
    return updatedExpense;
  }, [expenses]);

  const deleteExpense = useCallback((id: string) => {
    const newExpenses = storage.deleteExpense(id);
    setExpenses(newExpenses);
  }, []);

  const deleteExpenses = useCallback((ids: string[]) => {
    const newExpenses = storage.deleteExpenses(ids);
    setExpenses(newExpenses);
  }, []);

  const getExpenseById = useCallback((id: string) => {
    return expenses.find((e) => e.id === id);
  }, [expenses]);

  const updateFilters = useCallback((newFilters: Partial<ExpenseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const setThisMonthFilter = useCallback(() => {
    setFilters({
      ...defaultFilters,
      startDate: getMonthStartISO(),
      endDate: getMonthEndISO(),
    });
  }, []);

  const filteredExpenses = filterExpenses(expenses, filters);
  const summary = calculateSummary(expenses);
  const filteredSummary = calculateSummary(filteredExpenses);

  return {
    expenses,
    filteredExpenses,
    filters,
    isLoading,
    summary,
    filteredSummary,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteExpenses,
    getExpenseById,
    updateFilters,
    resetFilters,
    setThisMonthFilter,
  };
}
