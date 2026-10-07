import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  Filter, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { lastSevenDaysExpenses } from '@/lib/finance';
import { Expense } from '@/lib/mockData';

interface ExpenseTrackerProps {
  expenses: Expense[];
  exchangeRate: number;
  onAddExpense: (title: string, amountGbp: number, category: Expense['category']) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  exchangeRate,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amountGbp, setAmountGbp] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories: Expense['category'][] = [
    'Rent', 'Food', 'Transport', 'Gym', 'Shopping', 'Travel', 'Entertainment', 'Bills', 'University'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountGbp);
    if (title.trim() && !isNaN(amount) && amount > 0) {
      await onAddExpense(title.trim(), amount, category);
      setTitle('');
      setAmountGbp('');
      setCategory('Food');
      setIsAddOpen(false);
    }
  };

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedFilter === 'All' || e.category === selectedFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedFilter]);

  // Weekly summary logic (last 7 days expenses)
  const weeklySummary = useMemo(() => {
    const weeklyExpenses = lastSevenDaysExpenses(expenses);

    const categoryBreakdowns: { [key: string]: number } = {};
    let total = 0;

    for (const exp of weeklyExpenses) {
      categoryBreakdowns[exp.category] = (categoryBreakdowns[exp.category] || 0) + exp.amountGbp;
      total += exp.amountGbp;
    }

    return {
      breakdowns: categoryBreakdowns,
      totalGbp: total
    };
  }, [expenses]);

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>UK Expense Command & Logger</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">Multi-currency (GBP/INR) transaction tracker</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-3.5 w-3.5" /> Log Expense
        </button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Weekly Summary Row */}
        <div className="p-4 bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-indigo-500/20 dark:border-indigo-500/10 pb-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Weekly Spend (Last 7 Days)</span>
            <div className="text-right">
              <span className="text-sm font-black text-zinc-900 dark:text-white block">£{weeklySummary.totalGbp.toFixed(2)}</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400">₹{Math.round(weeklySummary.totalGbp * exchangeRate).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const val = weeklySummary.breakdowns[cat] || 0;
              if (val === 0) return null;
              return (
                <div key={cat} className="p-2 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">{cat}</span>
                  <span className="text-xs font-black text-zinc-900 dark:text-white block">£{val.toFixed(2)}</span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400">₹{Math.round(val * exchangeRate).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
            {Object.keys(weeklySummary.breakdowns).length === 0 && (
              <div className="col-span-full text-center text-xs text-zinc-500 py-2">No spend recorded in the last 7 days.</div>
            )}
          </div>
        </div>

        {/* Filters and List */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            
            {/* Category Filter dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expenses Scroll Area */}
          <div className="overflow-y-auto max-h-[280px] space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredExpenses.length === 0 ? (
              <div className="text-center text-xs text-zinc-500 py-10">No matching expenses found.</div>
            ) : (
              filteredExpenses.map((exp) => (
                <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 group hover:border-indigo-500/20 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase min-w-[70px] text-center border border-zinc-200 dark:border-white/5">
                      {exp.category}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white block truncate max-w-[120px] sm:max-w-[200px]">{exp.title}</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400">{exp.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-zinc-900 dark:text-white block">£{exp.amountGbp.toFixed(2)}</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400">₹{Math.round(exp.amountInr).toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      {/* MODAL: Log Expense */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log New Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Expense Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tesco Groceries, Sainsbury, Bus Pass"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Amount (£ GBP)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountGbp}
                onChange={(e) => setAmountGbp(e.target.value)}
                placeholder="42.50"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {amountGbp && !isNaN(parseFloat(amountGbp)) && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-250 dark:border-white/5 text-xs text-zinc-650 dark:text-zinc-400">
              Estimated INR amount: <span className="font-bold text-zinc-900 dark:text-white">₹{Math.round(parseFloat(amountGbp) * exchangeRate).toLocaleString('en-IN')}</span> (at current rate £1 = ₹{exchangeRate.toFixed(2)})
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Add Expense Logs
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
