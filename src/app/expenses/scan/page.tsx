'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useExpenseContext } from '@/context/ExpenseContext';
import { BillScanner, ExpenseForm } from '@/components/expenses';
import { Card, CardHeader, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { ParsedReceipt } from '@/lib/receiptParser';
import { ExpenseFormData, Expense, CATEGORY_DESCRIPTIONS } from '@/types/expense';
import { getTodayISO } from '@/lib/utils';

export default function ScanBillPage() {
  const router = useRouter();
  const { addExpense } = useExpenseContext();
  const { showToast } = useToast();
  const [scanResult, setScanResult] = useState<ParsedReceipt | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleScanComplete = (result: ParsedReceipt) => {
    setScanResult(result);
    setShowForm(true);

    if (result.confidence < 50) {
      showToast('Low confidence scan. Please review the extracted data carefully.', 'info');
    } else {
      showToast('Receipt scanned successfully!');
    }
  };

  const handleSubmit = (data: ExpenseFormData) => {
    addExpense(data);
    showToast('Expense added successfully');
    router.push('/expenses');
  };

  const handleRescan = () => {
    setScanResult(null);
    setShowForm(false);
  };

  // Convert scan result to initial form data
  // Description is auto-generated from category
  const initialFormData: Expense | undefined = scanResult
    ? {
        id: '',
        amount: scanResult.amount || 0,
        category: scanResult.category,
        description: CATEGORY_DESCRIPTIONS[scanResult.category],
        date: scanResult.date || getTodayISO(),
        currency: scanResult.currency,
        currencySymbol: scanResult.currencySymbol,
        createdAt: '',
        updatedAt: '',
      }
    : undefined;

  return (
    <div className={showForm ? "max-w-4xl mx-auto" : "max-w-2xl mx-auto"}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scan Receipt</h1>
        <p className="text-gray-500 mt-1">
          Upload a photo of your receipt to automatically extract expense details
        </p>
      </div>

      {!showForm ? (
        <Card>
          <BillScanner onScanComplete={handleScanComplete} />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Image and Form side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanned Image */}
            {scanResult?.scannedImage && (
              <Card className="overflow-hidden">
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                  <Image
                    src={scanResult.scannedImage}
                    alt="Scanned receipt"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confidence: {Math.round(scanResult.confidence)}%</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Edit Form */}
            <Card>
              <CardHeader
                title="Review & Edit"
                subtitle="Verify the extracted details before saving"
              />
              <div className="mt-2 mb-4 grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">Amount:</span>{' '}
                  <span className="font-medium">
                    {scanResult?.amount
                      ? `${scanResult.currencySymbol}${scanResult.amount.toFixed(2)}`
                      : 'Not detected'}
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">Date:</span>{' '}
                  <span className="font-medium">
                    {scanResult?.date || 'Not detected'}
                  </span>
                </div>
              </div>
              <ExpenseForm
                onSubmit={handleSubmit}
                initialData={initialFormData}
                submitLabel="Save Expense"
              />
            </Card>
          </div>

          {/* Extracted Text (collapsible) */}
          {scanResult?.rawText && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                View extracted text
              </summary>
              <Card className="mt-2 bg-gray-50">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto max-h-48">
                  {scanResult.rawText}
                </pre>
              </Card>
            </details>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="ghost" onClick={handleRescan}>
              Scan Another Receipt
            </Button>
            <Button variant="ghost" onClick={() => router.push('/expenses/new')}>
              Enter Manually Instead
            </Button>
          </div>
        </div>
      )}

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
