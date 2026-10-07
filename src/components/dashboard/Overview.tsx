import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { LoanDetails } from '@/lib/mockData';

interface OverviewProps {
  exchangeRate: number;
  rateSource: string;
  rateUpdatedAt: string;
  monthlySpendGbp: number;
  loanDetails: LoanDetails;
  totalSavingsGbp: number;
}

export const Overview: React.FC<OverviewProps> = ({exchangeRate,rateSource,rateUpdatedAt,monthlySpendGbp,loanDetails,totalSavingsGbp}) => {
  const figures = [
    {label:'Spent this month',value:`£${monthlySpendGbp.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})}`,detail:`₹${Math.round(monthlySpendGbp*exchangeRate).toLocaleString('en-IN')} at the displayed rate`},
    {label:'Loan principal remaining',value:`₹${Math.round(loanDetails.loanAmountInr-loanDetails.amountRepaidInr).toLocaleString('en-IN')}`,detail:'Recorded principal less payments; excludes accrued interest'},
    {label:'Saved toward your goals',value:`£${totalSavingsGbp.toLocaleString('en-GB',{maximumFractionDigits:2})}`,detail:'Total recorded across your savings goals'},
  ];
  return <section aria-label="Money at a glance" className="space-y-5">
    <div className="metrics-grid grid grid-cols-1 sm:grid-cols-3 gap-0">
      {figures.map(figure=><Card key={figure.label} noise={false}><CardContent className="py-5 space-y-3"><p className="text-sm text-zinc-600 dark:text-zinc-400">{figure.label}</p><h4 className="text-zinc-900 dark:text-white">{figure.value}</h4><p className="text-xs text-zinc-500 leading-relaxed">{figure.detail}</p></CardContent></Card>)}
    </div>
    <div className="exchange-strip"><span className="font-medium text-zinc-900 dark:text-white tabular-nums">£1 = ₹{exchangeRate.toFixed(2)}</span><span>{rateSource === 'api' ? 'Live exchange rate' : rateSource === 'cache' ? 'Cached exchange rate' : 'Estimated exchange rate'}</span>{rateUpdatedAt && <span>Updated {rateUpdatedAt}</span>}</div>
  </section>;
};
