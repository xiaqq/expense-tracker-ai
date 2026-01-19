'use client';

import { ReactNode } from 'react';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ToastProvider } from '@/components/ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ExpenseProvider>
      <ToastProvider>{children}</ToastProvider>
    </ExpenseProvider>
  );
}
