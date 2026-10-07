'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { SavingsTracker } from '@/components/dashboard/SavingsTracker';
import { LivingEstimator } from '@/components/dashboard/LivingEstimator';

export default function PlanningPage() {
  const {
    loading,
    exchangeRate,
    savings,
    estimates,
    onUpdateSavingsGoal,
    onAddSavingsGoal,
    onUpdateEstimate,
    onAddEstimate
  } = useDashboard();

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="page-header">
        <h2 className="page-title">
          Savings & Cost Planning
        </h2>
        <p className="text-sm text-zinc-500">
          Configure financial goals for your UK journey and estimate your monthly living budget requirements
        </p>
      </header>

      {/* Grid: Savings Tracker & Cost of Living Estimator */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col justify-stretch">
          <SavingsTracker
            goals={savings}
            exchangeRate={exchangeRate}
            onUpdateGoal={onUpdateSavingsGoal}
            onAddGoal={onAddSavingsGoal}
          />
        </div>
        <div className="flex flex-col justify-stretch">
          <LivingEstimator
            estimates={estimates}
            exchangeRate={exchangeRate}
            onUpdateEstimate={onUpdateEstimate}
            onAddEstimate={handleAddEstimateOverride}
          />
        </div>
      </div>
    </div>
  );

  // Small helper to solve signature matching if needed
  async function handleAddEstimateOverride(category: string, amountGbp: number) {
    await onAddEstimate(category, amountGbp);
  }
}
