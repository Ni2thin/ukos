import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { RefreshCw, ArrowRightLeft, DollarSign } from 'lucide-react';
import { LoanDetails } from '@/lib/mockData';

interface LiveConverterProps {
  exchangeRate: number;
  loanDetails: LoanDetails;
  onRefreshRate: () => Promise<void>;
}

export const LiveConverter: React.FC<LiveConverterProps> = ({
  exchangeRate,
  loanDetails,
  onRefreshRate,
}) => {
  const [gbpInput, setGbpInput] = useState<string>('1');
  const [inrInput, setInrInput] = useState<string>(exchangeRate.toFixed(2));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync inputs if exchangeRate changes
  useEffect(() => {
    if (gbpInput) {
      const gbpVal = parseFloat(gbpInput);
      if (!isNaN(gbpVal)) {
        setInrInput((gbpVal * exchangeRate).toFixed(2));
      }
    }
  }, [exchangeRate]);

  const handleGbpChange = (val: string) => {
    setGbpInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setInrInput((num * exchangeRate).toFixed(2));
    } else {
      setInrInput('');
    }
  };

  const handleInrChange = (val: string) => {
    setInrInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setGbpInput((num / exchangeRate).toFixed(2));
    } else {
      setGbpInput('');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshRate();
    setTimeout(() => setIsRefreshing(false), 800); // UI visual polish cooldown
  };

  // Static/Dynamic figures from prompt
  const tuitionRemainingGbp = 18000;
  const loanOutstandingInr = loanDetails.loanAmountInr - loanDetails.amountRepaidInr;

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Live Currency Converter</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">GBP ↔ INR Live Exchange Conversion</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-50 duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Converter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          {/* GBP input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">British Pound (£)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500 font-semibold">£</span>
              <input
                type="number"
                value={gbpInput}
                onChange={(e) => handleGbpChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Inter-icon decoration */}
          <div className="hidden sm:flex absolute left-1/2 top-7 -translate-x-1/2 p-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full text-zinc-500 dark:text-zinc-400 z-10">
            <ArrowRightLeft className="h-3 w-3" />
          </div>

          {/* INR input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Indian Rupee (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500 font-semibold">₹</span>
              <input
                type="number"
                value={inrInput}
                onChange={(e) => handleInrChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Dynamic metrics cards */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/60 dark:border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Tuition Remaining</span>
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">£{tuitionRemainingGbp.toLocaleString('en-GB')}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">₹{Math.round(tuitionRemainingGbp * exchangeRate).toLocaleString('en-IN')}</div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/60 dark:border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Loan Outstanding</span>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-500">₹{loanOutstandingInr.toLocaleString('en-IN')}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">£{Math.round(loanOutstandingInr / exchangeRate).toLocaleString('en-GB')}</div>
          </div>
        </div>

        {/* Quick Reference Grid */}
        <div className="pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Quick Reference</div>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 20, 50, 100, 500].map((val) => (
              <div 
                key={val} 
                onClick={() => handleGbpChange(val.toString())}
                className="p-2 bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-zinc-200/60 dark:border-white/5 rounded-lg text-center cursor-pointer transition-colors duration-200"
              >
                <div className="text-xs font-bold text-zinc-900 dark:text-white">£{val}</div>
                <div className="text-[9px] text-zinc-500 dark:text-zinc-400">₹{Math.round(val * exchangeRate).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
