import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { 
  TrendingUp, 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  Calendar,
  IndianRupee 
} from 'lucide-react';
import { LoanDetails } from '@/lib/mockData';

interface OverviewProps {
  exchangeRate: number;
  rateSource: string;
  rateUpdatedAt: string;
  monthlySpendGbp: number;
  loanDetails: LoanDetails;
  totalSavingsGbp: number;
}

export const Overview: React.FC<OverviewProps> = ({
  exchangeRate,
  rateSource,
  rateUpdatedAt,
  monthlySpendGbp,
  loanDetails,
  totalSavingsGbp,
}) => {
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    // Semester start: September 21, 2026
    const semesterStart = new Date('2026-09-21T00:00:00');
    const now = new Date();
    const diffTime = semesterStart.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays > 0 ? diffDays : 0);
  }, []);

  const loanOutstandingInr = loanDetails.loanAmountInr - loanDetails.amountRepaidInr;
  const loanOutstandingGbp = loanOutstandingInr / exchangeRate;


  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
      {/* CARD 1: Live exchange rate */}
      <Card className="hover:scale-[1.02] duration-200" glow>
        <CardContent className="p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">GBP ↔ INR</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              ₹{exchangeRate.toFixed(2)}
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1 truncate">
              {rateSource === 'cache' ? 'Cached' : rateSource === 'api' ? 'Live API' : 'Fallback'} • {rateUpdatedAt}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Monthly spend */}
      <Card className="hover:scale-[1.02] duration-200">
        <CardContent className="p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Monthly Spend</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              £{monthlySpendGbp.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
              ₹{Math.round(monthlySpendGbp * exchangeRate).toLocaleString('en-IN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: Loan Outstanding */}
      <Card className="hover:scale-[1.02] duration-200">
        <CardContent className="p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Loan Outstanding</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight truncate">
              ₹{Math.round(loanOutstandingInr).toLocaleString('en-IN')}
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
              £{Math.round(loanOutstandingGbp).toLocaleString('en-GB')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: Savings */}
      <Card className="hover:scale-[1.02] duration-200">
        <CardContent className="p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Savings</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              £{totalSavingsGbp.toLocaleString('en-GB')}
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
              ₹{Math.round(totalSavingsGbp * exchangeRate).toLocaleString('en-IN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 5: Cash Available */}
      <Card className="hover:scale-[1.02] duration-200">
        <CardContent className="p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Cash Balance</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Not recorded
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
              Add a cash account to track this balance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 6: Days until semester */}
      <Card className="hover:scale-[1.02] duration-200">
        <CardContent className="p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Semester Starts</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {daysLeft} Days
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">
              Surrey MSc • Sept 21
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
