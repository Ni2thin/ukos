import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Plus, Edit2, Info } from 'lucide-react';
import { LivingEstimate } from '@/lib/mockData';

interface LivingEstimatorProps {
  estimates: LivingEstimate[];
  exchangeRate: number;
  onUpdateEstimate: (estimate: LivingEstimate) => Promise<void>;
  onAddEstimate: (category: string, amountGbp: number) => Promise<void>;
}

export const LivingEstimator: React.FC<LivingEstimatorProps> = ({
  estimates,
  exchangeRate,
  onUpdateEstimate,
  onAddEstimate,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<LivingEstimate | null>(null);

  // Form states
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Edit states
  const [editAmount, setEditAmount] = useState('');

  const totalGbp = estimates.reduce((sum, e) => sum + e.amountGbp, 0);
  const totalInr = totalGbp * exchangeRate;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (newCategory.trim() && !isNaN(amt) && amt > 0) {
      await onAddEstimate(newCategory.trim(), amt);
      setNewCategory('');
      setNewAmount('');
      setIsAddOpen(false);
    }
  };

  const handleEditClick = (est: LivingEstimate) => {
    setSelectedEstimate(est);
    setEditAmount(est.amountGbp.toString());
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(editAmount);
    if (selectedEstimate && !isNaN(amt) && amt >= 0) {
      await onUpdateEstimate({
        ...selectedEstimate,
        amountGbp: amt
      });
      setEditAmount('');
      setIsEditOpen(false);
      setSelectedEstimate(null);
    }
  };

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>UK Cost of Living Estimator</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">Pre-departure budget planning simulator</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Estimator disclaimer info banner */}
        <div className="p-3 bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl flex gap-2.5 items-start">
          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-650 dark:text-zinc-400 leading-normal">
            Use this section to plan your monthly living expenses before arriving in the UK. Estimates are converted using live exchange rates to show INR requirements.
          </p>
        </div>

        {/* Master Cost Row */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Estimated Total Cost</span>
            <div className="text-xl font-black text-zinc-900 dark:text-white mt-1">
              £{totalGbp.toLocaleString('en-GB')}/month
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">INR Monthly Equivalent</span>
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
              ₹{Math.round(totalInr).toLocaleString('en-IN')}/month
            </div>
          </div>
        </div>

        {/* Estimates Progress Allocation and Slider adjustments */}
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {estimates.map((est) => {
            const pctShare = totalGbp > 0 ? Math.round((est.amountGbp / totalGbp) * 100) : 0;
            return (
              <div 
                key={est.id} 
                onClick={() => handleEditClick(est)}
                className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-2 cursor-pointer hover:border-indigo-500/25 transition-all duration-200 group"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{est.category}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">({pctShare}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-white">£{est.amountGbp}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-1.5">
                      ~ ₹{Math.round(est.amountGbp * exchangeRate).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                
                {/* Micro visual progress bar */}
                <div className="w-full bg-zinc-150 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500/80 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pctShare}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* MODAL: Add Cost Item */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Estimated Expense Item">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category Name</label>
            <input
              type="text"
              required
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Mobile SIM Card, Travel Pass"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Estimated Cost (£ GBP / month)</label>
            <input
              type="number"
              required
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="e.g. 15"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Add Estimation Item
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Cost Item */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEstimate(null);
        }} 
        title={selectedEstimate ? `Update Cost for ${selectedEstimate.category}` : ''}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Estimated Cost (£ GBP / month)</label>
            <input
              type="number"
              required
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Confirm Cost Modification
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
