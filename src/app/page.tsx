'use client';

import React from 'react';
import { currentMonthExpenses } from '@/lib/finance';
import { useDashboard } from '@/context/DashboardContext';
import { Overview } from '@/components/dashboard/Overview';
import { LiveConverter } from '@/components/dashboard/LiveConverter';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { AIAssistant } from '@/components/dashboard/AIAssistant';

export default function Home() {
  const {
    loading,
    exchangeRate,
    rateSource,
    rateUpdatedAt,
    expenses,
    loanDetails,
    events,
    savings,
    onRefreshRate,
    onAddEvent,
    onDeleteEvent
  } = useDashboard();

  if (loading) return null;

  const monthlySpendGbp = currentMonthExpenses(expenses).reduce((sum, e) => sum + e.amountGbp, 0);
  const totalSavingsGbp = savings.reduce((sum, g) => sum + g.currentGbp, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-1 select-none">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
          Overview Dashboard
        </h2>
        <p className="text-xs text-zinc-500">
          UK Student Life command center with live rate tickers, schedules, and AI budgeting
        </p>
      </header>

      {/* Metrics Row */}
      <Overview
        exchangeRate={exchangeRate}
        rateSource={rateSource}
        rateUpdatedAt={rateUpdatedAt}
        monthlySpendGbp={monthlySpendGbp}
        loanDetails={loanDetails}
        totalSavingsGbp={totalSavingsGbp}
      />

      {/* Grid Layout for Overview Widgets */}
      <div className="space-y-6">
        {/* Row 1: Live Converter & AI Companion side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <LiveConverter
              exchangeRate={exchangeRate}
              loanDetails={loanDetails}
              onRefreshRate={onRefreshRate}
            />
          </div>
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <AIAssistant
              exchangeRate={exchangeRate}
              loanDetails={loanDetails}
              expenses={expenses}
              events={events}
              savings={savings}
            />
          </div>
        </div>

        {/* Row 2: Full Width Academic & Life Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <CalendarWidget
              events={events}
              onAddEvent={onAddEvent}
              onDeleteEvent={onDeleteEvent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
