'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { LoanManager } from '@/components/dashboard/LoanManager';
import { ExpenseTracker } from '@/components/dashboard/ExpenseTracker';
import { Analytics } from '@/components/dashboard/Analytics';

export default function FinancesPage() {
  const {
    loading,
    exchangeRate,
    expenses,
    loanDetails,
    transactions,
    onAddExpense,
    onDeleteExpense,
    onAddLoanTransaction,
    onDeleteLoanTransaction,
    onUpdateLoanDetails
  } = useDashboard();

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="page-header">
        <h2 className="page-title">
          Money overview
        </h2>
        <p className="text-sm text-zinc-500">
          Manage your education loan parameters, log student transactions and analyze your monthly expenditure breakdowns
        </p>
      </header>

      {/* Row 1: Education Loan command center */}
      <div className="w-full">
        <LoanManager
          loanDetails={loanDetails}
          transactions={transactions}
          exchangeRate={exchangeRate}
          onAddTransaction={onAddLoanTransaction}
          onDeleteTransaction={onDeleteLoanTransaction}
          onUpdateDetails={onUpdateLoanDetails}
        />
      </div>

      {/* Row 2: Expense Tracker and Recharts Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col justify-stretch">
          <ExpenseTracker
            expenses={expenses}
            exchangeRate={exchangeRate}
            onAddExpense={onAddExpense}
            onDeleteExpense={onDeleteExpense}
          />
        </div>
        <div className="flex flex-col justify-stretch">
          <Analytics
            expenses={expenses}
            exchangeRate={exchangeRate}
          />
        </div>
      </div>
    </div>
  );
}
