import { calculateMonthlyEmi } from '@/lib/finance';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { 
  Plus, 
  Percent, 
  Clock, 
  TrendingDown, 
  DollarSign, 
  Activity,
  History,
  Trash2 
} from 'lucide-react';
import { LoanDetails, LoanTransaction } from '@/lib/mockData';

interface LoanManagerProps {
  loanDetails: LoanDetails;
  transactions: LoanTransaction[];
  exchangeRate: number;
  onAddTransaction: (amountInr: number, type: 'EMI' | 'Extra Payment') => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onUpdateDetails: (details: LoanDetails) => Promise<void>;
}

export const LoanManager: React.FC<LoanManagerProps> = ({
  loanDetails,
  transactions,
  exchangeRate,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateDetails,
}) => {
  // Modal states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);

  // Form states for new transaction
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'EMI' | 'Extra Payment'>('EMI');

  // Form states for loan details
  const [loanAmount, setLoanAmount] = useState(loanDetails.loanAmountInr.toString());
  const [interestRate, setInterestRate] = useState(loanDetails.interestRate.toString());
  const [tenureYears, setTenureYears] = useState(loanDetails.tenureYears.toString());
  const [amountRepaid, setAmountRepaid] = useState(loanDetails.amountRepaidInr.toString());

  // Sync inputs if loanDetails updates externally
  useEffect(() => {
    setLoanAmount(loanDetails.loanAmountInr.toString());
    setInterestRate(loanDetails.interestRate.toString());
    setTenureYears(loanDetails.tenureYears.toString());
    setAmountRepaid(loanDetails.amountRepaidInr.toString());
  }, [loanDetails]);

  // EMI Calculator states
  const [emiLoan, setEmiLoan] = useState(4000000);
  const [emiRate, setEmiRate] = useState(9.65);
  const [emiTenure, setEmiTenure] = useState(6);
  const [calculatedEmi, setCalculatedEmi] = useState({ inr: 0, gbp: 0 });

  useEffect(() => {
    const emiInr = calculateMonthlyEmi(emiLoan, emiRate, emiTenure);
    const emiGbp = emiInr / exchangeRate;
    setCalculatedEmi({ inr: Math.round(emiInr), gbp: Math.round(emiGbp) });
  }, [emiLoan, emiRate, emiTenure, exchangeRate]);

  // Main loan metrics
  const outstandingInr = loanDetails.loanAmountInr - loanDetails.amountRepaidInr;
  const outstandingGbp = outstandingInr / exchangeRate;
  const repaidPercent = loanDetails.loanAmountInr > 0 ? Math.min(
    100,
    Math.round((loanDetails.amountRepaidInr / loanDetails.loanAmountInr) * 100)
  ) : 0;

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (!isNaN(amt) && amt > 0) {
      await onAddTransaction(amt, txType);
      setTxAmount('');
      setIsAddTxOpen(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const tenure = parseFloat(tenureYears);
    const repaid = parseFloat(amountRepaid);
    if (!isNaN(amt) && !isNaN(rate) && !isNaN(tenure) && !isNaN(repaid)) {
      await onUpdateDetails({
        loanAmountInr: amt,
        interestRate: rate,
        tenureYears: tenure,
        amountRepaidInr: repaid,
      });
      setIsEditDetailsOpen(false);
    }
  };

  return (
    <Card className="select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Education Loan Command Center</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">₹40L SBI Student Loan Management & Tracker</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditDetailsOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-xs font-semibold text-zinc-650 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/40 transition-colors"
          >
            Edit Loan Parameters
          </button>
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
          >
            <Plus className="h-3.5 w-3.5" /> Log Payment
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loanDetails.loanAmountInr === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
            <div className="p-4 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-500 animate-pulse-glow">
              <Activity className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No Sanctioned Education Loan</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                Your loan principal is currently set to ₹0. Once your education loan is approved or sanctioned, click the "Edit Loan Parameters" button above to configure EMI trackers and interest schedules.
              </p>
            </div>
            <button
              onClick={() => setIsEditDetailsOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors shadow-md shadow-indigo-600/10"
            >
              Configure Loan Parameters
            </button>
          </div>
        ) : (
          <>
            {/* Row 1: Loan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Total Borrowed</span>
                <div className="mt-2">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">₹{loanDetails.loanAmountInr.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Interest: {loanDetails.interestRate}% • {loanDetails.tenureYears} Years
                  </p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Amount Repaid</span>
                <div className="mt-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{loanDetails.amountRepaidInr.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    From {transactions.length} installments & extra logs
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">Net Outstanding</span>
                <div className="mt-2">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-500">₹{outstandingInr.toLocaleString('en-IN')}</span>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    £{Math.round(outstandingGbp).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* Repayment progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span>Repayment Progress</span>
                <span className="text-indigo-650 dark:text-indigo-400">{repaidPercent}% Paid</span>
              </div>
              <div className="w-full bg-zinc-150 dark:bg-zinc-800 rounded-full h-3.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-600 dark:from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${repaidPercent}%` }}
                />
              </div>
            </div>

            {/* Dynamic section: EMI Calculator & Transaction history in two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Column A: Amortization / EMI Calculator */}
              <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Loan EMI Calculator
                </h4>

                {/* Inputs sliders */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400">Principal</span>
                      <span className="text-zinc-900 dark:text-white font-bold">₹{(emiLoan / 100000).toFixed(1)}L</span>
                    </div>
                    <input 
                      type="range" 
                      min={1000000} 
                      max={6000000} 
                      step={50000}
                      value={emiLoan}
                      onChange={(e) => setEmiLoan(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400">Interest Rate</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{emiRate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={7} 
                      max={15} 
                      step={0.05}
                      value={emiRate}
                      onChange={(e) => setEmiRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400">Tenure</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{emiTenure} Years</span>
                    </div>
                    <input 
                      type="range" 
                      min={1} 
                      max={10} 
                      step={1}
                      value={emiTenure}
                      onChange={(e) => setEmiTenure(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Output Display */}
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Monthly EMI</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{calculatedEmi.inr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Equivalent GBP</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">£{calculatedEmi.gbp.toLocaleString('en-GB')}</span>
                  </div>
                </div>
              </div>

              {/* Column B: Transaction Logs */}
              <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between max-h-[300px]">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 border-b border-zinc-200 dark:border-white/5 pb-2 mb-2">
                  <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Repayment History
                </h4>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-850">
                  {transactions.length === 0 ? (
                    <div className="text-center text-xs text-zinc-500 py-8">No payments logged yet.</div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-100/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-white/5 group duration-200 hover:border-indigo-500/20">
                        <div>
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white block">{tx.type} Payment</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{tx.date}</span>
                        </div>
                        <div className="flex items-center gap-3.5">
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">- ₹{tx.amountInr.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">~ £{tx.amountGbp}</span>
                          </div>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Delete payment entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* MODAL: Log new payment */}
      <Modal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Log Loan Repayment">
        <form onSubmit={handleSubmitTx} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Repayment Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-zinc-500 font-semibold">₹</span>
              <input
                type="number"
                required
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="68000"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Payment Category / Type</label>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="EMI">Monthly EMI Payment</option>
              <option value="Extra Payment">Extra Principal Repayment</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Confirm & Save Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit loan details */}
      <Modal isOpen={isEditDetailsOpen} onClose={() => setIsEditDetailsOpen(false)} title="Configure Loan Settings">
        <form onSubmit={handleSaveDetails} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Sanctioned Loan Principal (INR)</label>
            <input
              type="number"
              required
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Annual Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              required
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tenure (Years)</label>
            <input
              type="number"
              required
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Amount Repaid Already (INR)</label>
            <input
              type="number"
              required
              value={amountRepaid}
              onChange={(e) => setAmountRepaid(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Update Parameters
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
