'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useExpenses } from '@/hooks/useExpenses';

type ExpenseContextType = ReturnType<typeof useExpenses>;

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const expenseState = useExpenses();

  return (
    <ExpenseContext.Provider value={expenseState}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
}
