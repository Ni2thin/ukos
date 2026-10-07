import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Plus, PiggyBank, Edit2, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '@/lib/mockData';

interface SavingsTrackerProps {
  goals: SavingsGoal[];
  exchangeRate: number;
  onUpdateGoal: (goal: SavingsGoal) => Promise<void>;
  onAddGoal: (title: string, targetGbp: number, category: string) => Promise<void>;
}

export const SavingsTracker: React.FC<SavingsTrackerProps> = ({
  goals,
  exchangeRate,
  onUpdateGoal,
  onAddGoal,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  // Update state
  const [depositAmount, setDepositAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true); // true for add, false for subtract

  // Totals
  const totalSavedGbp = goals.reduce((sum, g) => sum + g.currentGbp, 0);
  const totalTargetGbp = goals.reduce((sum, g) => sum + g.targetGbp, 0);
  const overallProgress = totalTargetGbp > 0 ? Math.round((totalSavedGbp / totalTargetGbp) * 100) : 0;

  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (newTitle.trim() && !isNaN(target) && target > 0) {
      await onAddGoal(newTitle.trim(), target, newCategory.trim());
      setNewTitle('');
      setNewTarget('');
      setNewCategory('General');
      setIsAddOpen(false);
    }
  };

  const handleQuickSave = async (goal: SavingsGoal, amount: number) => {
    const updated = {
      ...goal,
      currentGbp: Math.max(0, goal.currentGbp + amount)
    };
    await onUpdateGoal(updated);
  };

  const handleUpdateClick = (goal: SavingsGoal, deposit: boolean) => {
    setSelectedGoal(goal);
    setIsDeposit(deposit);
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (selectedGoal && !isNaN(amt) && amt > 0) {
      const diff = isDeposit ? amt : -amt;
      const updated = {
        ...selectedGoal,
        currentGbp: Math.max(0, selectedGoal.currentGbp + diff)
      };
      await onUpdateGoal(updated);
      setDepositAmount('');
      setIsUpdateOpen(false);
      setSelectedGoal(null);
    }
  };

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>UK Savings Goal Tracker</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">Track funds for emergencies, travel, and reserve fees</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add Goal
        </button>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Master Savings Progress Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Overall Portfolio Progress</span>
            <div className="text-xl font-black text-zinc-900 dark:text-white">
              £{totalSavedGbp.toLocaleString('en-GB')} / £{totalTargetGbp.toLocaleString('en-GB')}
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Equivalent Value: ₹{Math.round(totalSavedGbp * exchangeRate).toLocaleString('en-IN')} Saved
            </p>
          </div>
          
          <div className="relative flex items-center justify-center h-16 w-16 rounded-full border border-indigo-500/20 bg-indigo-600/10">
            <span className="text-sm font-black text-zinc-900 dark:text-white">{overallProgress}%</span>
            {/* Visual glow indicator */}
            <div className="absolute -inset-0.5 rounded-full bg-indigo-500/10 blur-sm -z-10" />
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentGbp / goal.targetGbp) * 100));
            return (
              <div key={goal.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-3 hover:border-indigo-500/10 duration-200">
                {/* Title and stats */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 text-[8px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 rounded uppercase">
                      {goal.category}
                    </span>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white mt-1">{goal.title}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      £{goal.currentGbp} / £{goal.targetGbp}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                      {pct}% Complete
                    </span>
                  </div>
                </div>

                {/* Individual Progress bar */}
                <div className="w-full bg-zinc-150 dark:bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Quick Add / Deduct tools */}
                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleQuickSave(goal, 50)}
                      className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded text-[9px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    >
                      +£50
                    </button>
                    <button
                      onClick={() => handleQuickSave(goal, 100)}
                      className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded text-[9px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    >
                      +£100
                    </button>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateClick(goal, true)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-[9px] font-bold text-white transition-colors"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => handleUpdateClick(goal, false)}
                      className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-white/5 rounded text-[9px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="text-center text-xs text-zinc-500 py-10">No savings goals configured. Add one to begin!</div>
          )}
        </div>
      </CardContent>

      {/* MODAL: Add Goal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Savings Goal">
        <form onSubmit={handleAddGoalSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Goal Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Emergency Fund, Euro Trip, Tech Upgrade"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Target Amount (£ GBP)</label>
              <input
                type="number"
                required
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="1500"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
              <input
                type="text"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Survival, Leisure, Travel"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Configure Savings Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Update Savings */}
      <Modal 
        isOpen={isUpdateOpen} 
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedGoal(null);
        }} 
        title={selectedGoal ? `${isDeposit ? 'Deposit into' : 'Withdraw from'} ${selectedGoal.title}` : ''}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Amount (£ GBP)</label>
            <input
              type="number"
              required
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Confirm Transaction
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
