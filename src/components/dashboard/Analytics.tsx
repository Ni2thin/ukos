import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Expense } from '@/lib/mockData';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

interface AnalyticsProps {
  expenses: Expense[];
  exchangeRate: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ expenses, exchangeRate }) => {
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<'GBP' | 'INR'>('GBP');

  // SSR hydration safeguard
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculate Category Data for Pie Chart
  const categoryData = React.useMemo(() => {
    const categoriesSum: { [key: string]: number } = {};
    expenses.forEach(e => {
      categoriesSum[e.category] = (categoriesSum[e.category] || 0) + e.amountGbp;
    });

    return Object.entries(categoriesSum).map(([name, valGbp]) => {
      const val = currency === 'GBP' ? valGbp : valGbp * exchangeRate;
      return {
        name,
        value: parseFloat(val.toFixed(2)),
        rawGbp: valGbp
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, exchangeRate, currency]);

  // 2. Calculate Trend Data for Line/Area Chart (by date)
  const trendData = React.useMemo(() => {
    const datesSum: { [key: string]: number } = {};
    
    // Sort expenses chronologically
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedExpenses.forEach(e => {
      // Group by date
      datesSum[e.date] = (datesSum[e.date] || 0) + e.amountGbp;
    });

    // Generate cumulative trend
    let runningTotalGbp = 0;
    return Object.entries(datesSum).map(([date, dailyGbp]) => {
      runningTotalGbp += dailyGbp;
      const displayVal = currency === 'GBP' ? runningTotalGbp : runningTotalGbp * exchangeRate;
      
      // Parse date to readable format e.g. "05 Jun"
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      return {
        date: formattedDate,
        amount: parseFloat(displayVal.toFixed(2)),
        rawDailyGbp: dailyGbp
      };
    });
  }, [expenses, exchangeRate, currency]);

  const COLORS = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#14b8a6', // Teal
    '#f43f5e', // Rose
    '#a1a1aa'  // Gray
  ];

  if (!mounted) {
    return (
      <Card className="h-[400px] select-none flex items-center justify-center">
        <span className="text-sm text-zinc-500">Loading charts...</span>
      </Card>
    );
  }

  const formatCurrency = (val: number) => {
    return currency === 'GBP' 
      ? `£${val.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
      : `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className="select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Expense Analytics Dashboard</CardTitle>
          <p className="text-sm text-zinc-500 mt-1">Categorized breakdown and cumulative spend tracker</p>
        </div>
        
        {/* Toggle Currency */}
        <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-0.5">
          <button
            onClick={() => setCurrency('GBP')}
            className={`px-3 py-1 text-sm font-bold rounded-lg transition-all ${
              currency === 'GBP' ? 'bg-indigo-600 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white'
            }`}
          >
            GBP (£)
          </button>
          <button
            onClick={() => setCurrency('INR')}
            className={`px-3 py-1 text-sm font-bold rounded-lg transition-all ${
              currency === 'INR' ? 'bg-indigo-600 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white'
            }`}
          >
            INR (₹)
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Chart 1: Category Breakdown (Pie) */}
          <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[280px]">
            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Spending Breakdown</h4>
            
            <div className="flex-grow flex flex-col sm:flex-row items-center justify-center gap-6">
              {categoryData.length === 0 ? (
                <span className="text-sm text-zinc-500">No data available</span>
              ) : (
                <>
                  {/* Recharts Pie Chart */}
                  <div className="w-full sm:w-[40%] h-[220px] shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Spend']}
                          contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: 'var(--tooltip-border)', borderRadius: '12px' }}
                          itemStyle={{ color: 'var(--foreground)' }}
                          labelStyle={{ color: 'var(--tooltip-text)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legends list */}
                  <div className="w-full sm:w-[60%] overflow-y-auto max-h-[220px] space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                    {categoryData.map((item, idx) => {
                      const total = categoryData.reduce((sum, i) => sum + i.value, 0);
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name} className="flex justify-between items-center text-sm py-0.5">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span 
                              className="h-2.5 w-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                            />
                            <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">{item.name}</span>
                          </div>
                          <div className="text-right font-bold text-zinc-900 dark:text-white pl-2 shrink-0 space-x-1.5 whitespace-nowrap">
                            <span>{pct}%</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">({formatCurrency(item.value)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chart 2: Cumulative Expense Trend (Area Chart) */}
          <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[340px]">
            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Cumulative Spend Trend</h4>
            
            <div className="flex-1 h-[260px] w-full">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-sm text-zinc-500">No data available</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--axis-color)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="var(--axis-color)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => formatCurrency(v)}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Total Cumulative']}
                      contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: 'var(--tooltip-border)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                      labelStyle={{ color: 'var(--tooltip-text)', fontSize: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorSpend)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
