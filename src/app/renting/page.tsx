'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Share2, 
  Edit3, 
  Clock, 
  Check,
  FlameKindling
} from 'lucide-react';

export default function RentingPage() {
  const {
    tenancyDetails,
    inventoryItems,
    rentPayments,
    landlordComms,
    billSplits,
    onUpdateTenancyDetails,
    onUpdateInventoryItems,
    onUpdateRentPayments,
    onUpdateLandlordComms,
    onUpdateBillSplits
  } = useDashboard();

  // Modals state
  const [isEditTenancyOpen, setIsEditTenancyOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  // Tenancy details edit state
  const [rentAmount, setRentAmount] = useState(tenancyDetails.rentAmountGbp);
  const [depositAmount, setDepositAmount] = useState(tenancyDetails.depositAmountGbp);
  const [depositScheme, setDepositScheme] = useState(tenancyDetails.depositSchemeRef);
  const [dueDate, setDueDate] = useState(tenancyDetails.dueDate);
  const [llName, setLlName] = useState(tenancyDetails.landlordName);
  const [llEmail, setLlEmail] = useState(tenancyDetails.landlordEmail);
  const [llPhone, setLlPhone] = useState(tenancyDetails.landlordPhone);

  // New inventory item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemStatus, setNewItemStatus] = useState<'Fine' | 'Needs Clean' | 'Damaged'>('Fine');
  const [newItemNotes, setNewItemNotes] = useState('');

  // New landlord comm state
  const [commType, setCommType] = useState<'Email' | 'Call' | 'Message' | 'In Person'>('Email');
  const [commSubject, setCommSubject] = useState('');
  const [commSummary, setCommSummary] = useState('');

  // New bill split state
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState(0);
  const [flatmatesInput, setFlatmatesInput] = useState('Alice, Bob');
  const [paidBy, setPaidBy] = useState('NITTHIN');

  // Tenancy submit
  const handleUpdateTenancy = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateTenancyDetails({
      rentAmountGbp: Number(rentAmount),
      depositAmountGbp: Number(depositAmount),
      depositSchemeRef: depositScheme,
      dueDate,
      landlordName: llName,
      landlordEmail: llEmail,
      landlordPhone: llPhone
    });
    setIsEditTenancyOpen(false);
  };

  // Inventory submit
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const items = [...inventoryItems, {
      id: `inv-${Date.now()}`,
      name: newItemName.trim(),
      status: newItemStatus,
      notes: newItemNotes.trim()
    }];
    await onUpdateInventoryItems(items);
    setNewItemName('');
    setNewItemNotes('');
    setIsAddInventoryOpen(false);
  };

  const handleDeleteInventory = async (id: string) => {
    const items = inventoryItems.filter(item => item.id !== id);
    await onUpdateInventoryItems(items);
  };

  const toggleInventoryStatus = async (id: string) => {
    const updated = inventoryItems.map(item => {
      if (item.id === id) {
        const nextStatus: Record<'Fine' | 'Needs Clean' | 'Damaged', 'Fine' | 'Needs Clean' | 'Damaged'> = {
          'Fine': 'Needs Clean',
          'Needs Clean': 'Damaged',
          'Damaged': 'Fine'
        };
        return { ...item, status: nextStatus[item.status] };
      }
      return item;
    });
    await onUpdateInventoryItems(updated);
  };

  // Comm submit
  const handleAddComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSubject.trim() || !commSummary.trim()) return;
    const comms = [{
      id: `comm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: commType,
      subject: commSubject.trim(),
      summary: commSummary.trim()
    }, ...landlordComms];
    await onUpdateLandlordComms(comms);
    setCommSubject('');
    setCommSummary('');
    setIsAddCommOpen(false);
  };

  const handleDeleteComm = async (id: string) => {
    const comms = landlordComms.filter(c => c.id !== id);
    await onUpdateLandlordComms(comms);
  };

  // Bill splits submit
  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName.trim() || billAmount <= 0) return;
    const mates = flatmatesInput.split(',').map(m => m.trim()).filter(Boolean);
    const newBill = {
      id: `bill-${Date.now()}`,
      name: billName.trim(),
      amountGbp: Number(billAmount),
      splitWith: mates,
      paidBy: paidBy.trim(),
      status: 'Unsettled' as const
    };
    await onUpdateBillSplits([newBill, ...billSplits]);
    setBillName('');
    setBillAmount(0);
    setIsAddBillOpen(false);
  };

  const handleDeleteBill = async (id: string) => {
    const splits = billSplits.filter(b => b.id !== id);
    await onUpdateBillSplits(splits);
  };

  const handleSettleBill = async (id: string) => {
    const updated = billSplits.map(b => {
      if (b.id === id) {
        return { ...b, status: b.status === 'Settled' ? 'Unsettled' as const : 'Settled' as const };
      }
      return b;
    });
    await onUpdateBillSplits(updated);
  };

  // Rent payments toggle
  const toggleRentPaymentStatus = async (id: string) => {
    const updated = rentPayments.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'Paid' ? 'Pending' as const : 'Paid' as const,
          datePaid: p.status === 'Paid' ? undefined : new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });
    await onUpdateRentPayments(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="page-header">
        <h2 className="page-title">
          Tenancy & Accommodation Vault
        </h2>
        <p className="text-sm text-zinc-500">
          UK Student rental command center. Monitor deposits, inventory logs, utility bill splits, and agency comms
        </p>
      </header>

      {/* Row 1: Tenancy Details & Rent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tenancy Overview Details */}
        <div className="lg:col-span-7 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Tenancy Details</h3>
              </div>
              <button 
                onClick={() => {
                  setRentAmount(tenancyDetails.rentAmountGbp);
                  setDepositAmount(tenancyDetails.depositAmountGbp);
                  setDepositScheme(tenancyDetails.depositSchemeRef);
                  setDueDate(tenancyDetails.dueDate);
                  setLlName(tenancyDetails.landlordName);
                  setLlEmail(tenancyDetails.landlordEmail);
                  setLlPhone(tenancyDetails.landlordPhone);
                  setIsEditTenancyOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
              >
                <Edit3 className="h-3 w-3" /> Edit Agreement
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Contracted Rent</span>
                <div className="text-lg font-black text-zinc-900 dark:text-white">£{tenancyDetails.rentAmountGbp} <span className="text-sm text-zinc-400 font-normal">/ month</span></div>
                <div className="text-xs text-zinc-500">Payable due day: {tenancyDetails.dueDate}</div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl space-y-1">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Deposit Protection</span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">£{tenancyDetails.depositAmountGbp}</div>
                <div className="text-xs text-zinc-500 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Ref: {tenancyDetails.depositSchemeRef || 'None'}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl md:col-span-2 space-y-2.5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Landlord / Letting Agent Contact</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <User className="h-3.5 w-3.5 text-zinc-400" /> {tenancyDetails.landlordName || 'Not configured'}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {tenancyDetails.landlordEmail || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {tenancyDetails.landlordPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rent Payments Ledger */}
        <div className="lg:col-span-5 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Rent Ledger</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 py-4 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {rentPayments.length === 0 ? (
                <div className="text-center text-sm text-zinc-500 py-6">No rent logs registered.</div>
              ) : (
                rentPayments.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5">
                    <div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white block">{p.month}</span>
                      <span className="text-xs text-zinc-400">
                        {p.status === 'Paid' ? `Paid on ${p.datePaid}` : 'Standing order pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-zinc-900 dark:text-white">£{p.amountGbp}</span>
                      <button
                        onClick={() => toggleRentPaymentStatus(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          p.status === 'Paid'
                            ? 'text-emerald-600 bg-emerald-600/10 hover:bg-emerald-600/20'
                            : 'text-amber-600 bg-amber-600/10 hover:bg-amber-600/20'
                        }`}
                      >
                        {p.status === 'Paid' ? 'Paid' : 'Pending'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Row 2: Move-In Inventory & Bill Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Move-In Inventory */}
        <div className="lg:col-span-6 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wrench className="h-4.5 w-4.5 text-emerald-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Move-In Inventory Condition</h3>
              </div>
              <button 
                onClick={() => setIsAddInventoryOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Log Item
              </button>
            </CardHeader>
            <CardContent className="space-y-2.5 py-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {inventoryItems.length === 0 ? (
                <div className="text-center text-sm text-zinc-500 py-10">No inventory logged. Document rooms early!</div>
              ) : (
                inventoryItems.map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 space-y-1 relative group">
                    <button
                      onClick={() => handleDeleteInventory(item.id)}
                      className="absolute top-2 right-2 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</span>
                      <button 
                        onClick={() => toggleInventoryStatus(item.id)}
                        className={`px-1.5 py-0.5 rounded text-xs font-black uppercase transition-all tracking-wider ${
                          item.status === 'Fine' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : item.status === 'Needs Clean' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {item.status}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 leading-normal">{item.notes || 'No description notes provided.'}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Utility Bill Splitter */}
        <div className="lg:col-span-6 flex flex-col justify-stretch">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Utility Bill Splitter</h3>
              </div>
              <button 
                onClick={() => setIsAddBillOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Split Bill
              </button>
            </CardHeader>
            <CardContent className="space-y-3.5 py-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {billSplits.length === 0 ? (
                <div className="text-center text-sm text-zinc-500 py-10">No split utility bills logged.</div>
              ) : (
                billSplits.map(b => {
                  const numPeople = b.splitWith.length + 1; // mates + creator
                  const perPerson = (b.amountGbp / numPeople).toFixed(2);
                  return (
                    <div key={b.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 space-y-2 relative group">
                      <button
                        onClick={() => handleDeleteBill(b.id)}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{b.name}</span>
                          <span className="text-xs text-zinc-400 block mt-0.5">Paid by: {b.paidBy}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-zinc-900 dark:text-white block">£{b.amountGbp}</span>
                          <span className="text-xs text-indigo-500 block">£{perPerson} each</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-white/5">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-xs uppercase font-bold text-zinc-500">Split:</span>
                          {b.splitWith.map(m => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-zinc-500">{m}</span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSettleBill(b.id)}
                          className={`px-2 py-0.5 rounded text-xs font-black uppercase transition-colors ${
                            b.status === 'Settled'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                          }`}
                        >
                          {b.status}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Row 3: Landlord Communication History */}
      <div>
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Landlord Communication Log</h3>
            </div>
            <button 
              onClick={() => setIsAddCommOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Log Interaction
            </button>
          </CardHeader>
          <CardContent className="space-y-3.5 py-4">
            {landlordComms.length === 0 ? (
              <div className="text-center text-sm text-zinc-500 py-6">No interactions logged yet. Keep record of all tenant calls/emails.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {landlordComms.map(c => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 space-y-1 relative group">
                    <button
                      onClick={() => handleDeleteComm(c.id)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">{c.type}</span>
                      <span className="text-xs text-zinc-400 font-mono">{c.date}</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white block pt-1">{c.subject}</span>
                    <p className="text-xs text-zinc-500 leading-normal">{c.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL 1: Edit Agreement */}
      <Modal isOpen={isEditTenancyOpen} onClose={() => setIsEditTenancyOpen(false)} title="Edit Tenancy Agreement Details">
        <form onSubmit={handleUpdateTenancy} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Monthly Rent (£)</label>
              <input
                type="number"
                required
                value={rentAmount}
                onChange={e => setRentAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Deposit Amount (£)</label>
              <input
                type="number"
                required
                value={depositAmount}
                onChange={e => setDepositAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Deposit Scheme Reference</label>
              <input
                type="text"
                value={depositScheme}
                onChange={e => setDepositScheme(e.target.value)}
                placeholder="e.g. TDS-9874"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                placeholder="e.g. 1st of month"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Landlord/Agent Name</label>
            <input
              type="text"
              required
              value={llName}
              onChange={e => setLlName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
              <input
                type="email"
                value={llEmail}
                onChange={e => setLlEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</label>
              <input
                type="text"
                value={llPhone}
                onChange={e => setLlPhone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Update Tenancy Agreement
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Log Inventory */}
      <Modal isOpen={isAddInventoryOpen} onClose={() => setIsAddInventoryOpen(false)} title="Log Inventory Item condition">
        <form onSubmit={handleAddInventory} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Item Name</label>
            <input
              type="text"
              required
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="e.g. Lounge Sofa, Radiator, Kitchen Hob"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Initial Condition Status</label>
            <select
              value={newItemStatus}
              onChange={e => setNewItemStatus(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Fine">Fine / Clean</option>
              <option value="Needs Clean">Needs Clean</option>
              <option value="Damaged">Damaged / Broken</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Verification Notes</label>
            <textarea
              value={newItemNotes}
              onChange={e => setNewItemNotes(e.target.value)}
              placeholder="Provide exact details of stains, scratches, or functionality faults..."
              rows={3}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Save Condition Log
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Log Interaction */}
      <Modal isOpen={isAddCommOpen} onClose={() => setIsAddCommOpen(false)} title="Log Landlord Interaction">
        <form onSubmit={handleAddComm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Interaction Type</label>
              <select
                value={commType}
                onChange={e => setCommType(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Email">Email</option>
                <option value="Call">Phone Call</option>
                <option value="Message">SMS/WhatsApp</option>
                <option value="In Person">In Person Visit</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Subject</label>
              <input
                type="text"
                required
                value={commSubject}
                onChange={e => setCommSubject(e.target.value)}
                placeholder="e.g. Repairs request, contract query"
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Conversation Summary</label>
            <textarea
              required
              value={commSummary}
              onChange={e => setCommSummary(e.target.value)}
              placeholder="What was agreed? Enter response details or promises made..."
              rows={3}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Log Interaction
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Split Bill */}
      <Modal isOpen={isAddBillOpen} onClose={() => setIsAddBillOpen(false)} title="Log Bill to Split">
        <form onSubmit={handleAddBill} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Bill Description</label>
            <input
              type="text"
              required
              value={billName}
              onChange={e => setBillName(e.target.value)}
              placeholder="e.g. Council tax exemption, Electricity bill"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Bill Amount (£)</label>
              <input
                type="number"
                required
                value={billAmount || ''}
                onChange={e => setBillAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Paid By</label>
              <input
                type="text"
                required
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Flatmates to Split With (comma separated)</label>
            <input
              type="text"
              required
              value={flatmatesInput}
              onChange={e => setFlatmatesInput(e.target.value)}
              placeholder="e.g. Alice, Bob, Charlie"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Log Bill Split
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
