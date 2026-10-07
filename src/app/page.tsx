'use client';

import React from 'react';
import Link from 'next/link';
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
    estimates,
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
      <header className="page-header">
        <h2 className="page-title">
          Your UK <span className="editorial-word">life</span>
        </h2>
        <p className="text-sm text-zinc-500">
          Your money, your plans, your next step. All in one place.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link href="/finances" className="rounded-md bg-indigo-600 text-white px-5 py-3 text-sm font-medium hover:bg-indigo-700">Manage money ↗</Link>
          <Link href="/planning" className="rounded-md border border-zinc-300 dark:border-white/20 px-5 py-3 text-sm font-medium hover:bg-indigo-500/10">Plan your next step</Link>
        </div>
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
              estimates={estimates}
              rateSource={rateSource}
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
