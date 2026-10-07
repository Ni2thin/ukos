'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getExpenses, saveExpense, deleteExpense,
  getLoanDetails, saveLoanDetails,
  getLoanTransactions, saveLoanTransaction, deleteLoanTransaction,
  getNotes, saveNote, deleteNote,
  getCalendarEvents, saveCalendarEvent, deleteCalendarEvent,
  getSavingsGoals, saveSavingsGoal,
  getLivingEstimates, saveLivingEstimate,
  getDocuments, saveDocument, deleteDocument,
  getProfile, saveProfile,
  getTenancyDetails, saveTenancyDetails,
  getInventoryItems, saveInventoryItems,
  getRentPayments, saveRentPayments,
  getLandlordComms, saveLandlordComms,
  getBillSplits, saveBillSplits,
  getJobApplications, saveJobApplication, deleteJobApplication,
  getGPDetails, saveGPDetails,
  getPrescriptions, savePrescription, deletePrescription,
  getMedicalAppointments, saveMedicalAppointment, deleteMedicalAppointment,
  getEmergencyContacts, saveEmergencyContact, deleteEmergencyContact,
  Expense, LoanDetails, LoanTransaction, Note, CalendarEvent, SavingsGoal, LivingEstimate, VaultDocument, UserProfile,
  TenancyDetails, InventoryItem, RentPayment, LandlordComm, BillSplit, JobApplication, GPDetails, Prescription, MedicalAppointment, EmergencyContact
} from '@/lib/db';
import { fetchGbpToInrRate } from '@/lib/exchange';

interface DashboardContextType {
  loading: boolean;
  exchangeRate: number;
  rateSource: string;
  rateUpdatedAt: string;
  expenses: Expense[];
  loanDetails: LoanDetails;
  transactions: LoanTransaction[];
  notes: Note[];
  events: CalendarEvent[];
  savings: SavingsGoal[];
  estimates: LivingEstimate[];
  documents: VaultDocument[];
  profile: UserProfile;
  // Renting states
  tenancyDetails: TenancyDetails;
  inventoryItems: InventoryItem[];
  rentPayments: RentPayment[];
  landlordComms: LandlordComm[];
  billSplits: BillSplit[];
  // Jobs states
  jobApplications: JobApplication[];
  // Health states
  gpDetails: GPDetails;
  prescriptions: Prescription[];
  appointments: MedicalAppointment[];
  emergencyContacts: EmergencyContact[];
  onRefreshRate: () => Promise<void>;
  onUpdateProfile: (profile: UserProfile) => Promise<void>;
  onAddExpense: (title: string, amountGbp: number, category: Expense['category']) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onAddLoanTransaction: (amountInr: number, type: 'EMI' | 'Extra Payment') => Promise<void>;
  onDeleteLoanTransaction: (id: string) => Promise<void>;
  onUpdateLoanDetails: (details: LoanDetails) => Promise<void>;
  onSaveNote: (note: Note) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onAddEvent: (title: string, date: string, category: CalendarEvent['category'], description?: string) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onUpdateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  onAddSavingsGoal: (title: string, targetGbp: number, category: string) => Promise<void>;
  onUpdateEstimate: (estimate: LivingEstimate) => Promise<void>;
  onAddEstimate: (category: string, amountGbp: number) => Promise<void>;
  onUploadDocument: (name: string, category: VaultDocument['category'], size: string, dataUrl?: string) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  // Renting handlers
  onUpdateTenancyDetails: (details: TenancyDetails) => Promise<void>;
  onUpdateInventoryItems: (items: InventoryItem[]) => Promise<void>;
  onUpdateRentPayments: (payments: RentPayment[]) => Promise<void>;
  onUpdateLandlordComms: (comms: LandlordComm[]) => Promise<void>;
  onUpdateBillSplits: (splits: BillSplit[]) => Promise<void>;
  // Jobs handlers
  onSaveJobApplication: (app: JobApplication) => Promise<void>;
  onDeleteJobApplication: (id: string) => Promise<void>;
  // Health handlers
  onUpdateGPDetails: (details: GPDetails) => Promise<void>;
  onSavePrescription: (p: Prescription) => Promise<void>;
  onDeletePrescription: (id: string) => Promise<void>;
  onSaveMedicalAppointment: (app: MedicalAppointment) => Promise<void>;
  onDeleteMedicalAppointment: (id: string) => Promise<void>;
  onSaveEmergencyContact: (c: EmergencyContact) => Promise<void>;
  onDeleteEmergencyContact: (id: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number>(129.42);
  const [rateSource, setRateSource] = useState<string>('fallback');
  const [rateUpdatedAt, setRateUpdatedAt] = useState<string>('Offline');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loanAmountInr: 4000000,
    interestRate: 9.65,
    tenureYears: 6,
    amountRepaidInr: 350000
  });
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [estimates, setEstimates] = useState<LivingEstimate[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'NITTHIN',
    passportNo: '',
    niNumber: '',
    shareCode: '',
    brpNumber: '',
    nhsNumber: '',
    ukPhone: ''
  });

  // Renting states
  const [tenancyDetails, setTenancyDetails] = useState<TenancyDetails>({
    rentAmountGbp: 0,
    depositAmountGbp: 0,
    depositSchemeRef: '',
    dueDate: '1st',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: ''
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [landlordComms, setLandlordComms] = useState<LandlordComm[]>([]);
  const [billSplits, setBillSplits] = useState<BillSplit[]>([]);

  // Jobs states
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  // Health states
  const [gpDetails, setGpDetails] = useState<GPDetails>({
    gpName: '',
    gpAddress: '',
    gpPhone: '',
    gpEmail: '',
    status: 'Not Registered'
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const rateRes = await fetchGbpToInrRate();
        setExchangeRate(rateRes.rate);
        setRateSource(rateRes.source);
        setRateUpdatedAt(rateRes.updatedAt);

        const [
          fetchedExpenses,
          fetchedLoan,
          fetchedTx,
          fetchedNotes,
          fetchedEvents,
          fetchedSavings,
          fetchedEstimates,
          fetchedDocs,
          fetchedProfile,
          // Renting
          fetchedTenancy,
          fetchedInventory,
          fetchedPayments,
          fetchedComms,
          fetchedSplits,
          // Jobs
          fetchedJobs,
          // Health
          fetchedGP,
          fetchedPresc,
          fetchedAppts,
          fetchedContacts
        ] = await Promise.all([
          getExpenses(),
          getLoanDetails(),
          getLoanTransactions(),
          getNotes(),
          getCalendarEvents(),
          getSavingsGoals(),
          getLivingEstimates(),
          getDocuments(),
          getProfile(),
          // Renting
          getTenancyDetails(),
          getInventoryItems(),
          getRentPayments(),
          getLandlordComms(),
          getBillSplits(),
          // Jobs
          getJobApplications(),
          // Health
          getGPDetails(),
          getPrescriptions(),
          getMedicalAppointments(),
          getEmergencyContacts()
        ]);

        setExpenses(fetchedExpenses);
        setLoanDetails(fetchedLoan);
        setTransactions(fetchedTx);
        setNotes(fetchedNotes);
        setEvents(fetchedEvents);
        setSavings(fetchedSavings);
        setEstimates(fetchedEstimates);
        setDocuments(fetchedDocs);
        setProfile(fetchedProfile);
        
        // Renting setters
        setTenancyDetails(fetchedTenancy);
        setInventoryItems(fetchedInventory);
        setRentPayments(fetchedPayments);
        setLandlordComms(fetchedComms);
        setBillSplits(fetchedSplits);

        // Jobs setters
        setJobApplications(fetchedJobs);

        // Health setters
        setGpDetails(fetchedGP);
        setPrescriptions(fetchedPresc);
        setAppointments(fetchedAppts);
        setEmergencyContacts(fetchedContacts);
      } catch (error) {
        console.error('Error hydrating context state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const onRefreshRate = async () => {
    const rateRes = await fetchGbpToInrRate();
    setExchangeRate(rateRes.rate);
    setRateSource(rateRes.source);
    setRateUpdatedAt(rateRes.updatedAt);
  };

  const onAddExpense = async (title: string, amountGbp: number, category: Expense['category']) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title,
      amountGbp,
      amountInr: Math.round(amountGbp * exchangeRate),
      category,
      date: new Date().toISOString().split('T')[0]
    };
    const saved = await saveExpense(newExp);
    setExpenses(prev => [saved, ...prev]);
  };

  const onDeleteExpense = async (id: string) => {
    const success = await deleteExpense(id);
    if (success) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const onAddLoanTransaction = async (amountInr: number, type: 'EMI' | 'Extra Payment') => {
    const newTx: LoanTransaction = {
      id: `tx-${Date.now()}`,
      amountInr,
      amountGbp: Math.round(amountInr / exchangeRate),
      date: new Date().toISOString().split('T')[0],
      type
    };
    const saved = await saveLoanTransaction(newTx);
    setTransactions(prev => [saved, ...prev]);
    setLoanDetails(prev => ({
      ...prev,
      amountRepaidInr: prev.amountRepaidInr + amountInr
    }));
  };

  const onDeleteLoanTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    const success = await deleteLoanTransaction(id);
    if (success && tx) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      setLoanDetails(prev => ({
        ...prev,
        amountRepaidInr: Math.max(0, prev.amountRepaidInr - tx.amountInr)
      }));
    }
  };

  const onUpdateLoanDetails = async (details: LoanDetails) => {
    const saved = await saveLoanDetails(details);
    setLoanDetails(saved);
  };

  const onSaveNote = async (note: Note) => {
    const saved = await saveNote(note);
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === saved.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const onDeleteNote = async (id: string) => {
    const success = await deleteNote(id);
    if (success) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const onAddEvent = async (title: string, date: string, category: CalendarEvent['category'], description?: string) => {
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      date,
      category,
      description
    };
    const saved = await saveCalendarEvent(newEvent);
    setEvents(prev => [...prev, saved]);
  };

  const onDeleteEvent = async (id: string) => {
    const success = await deleteCalendarEvent(id);
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const onUpdateSavingsGoal = async (goal: SavingsGoal) => {
    const saved = await saveSavingsGoal(goal);
    setSavings(prev => prev.map(g => g.id === saved.id ? saved : g));
  };

  const onAddSavingsGoal = async (title: string, targetGbp: number, category: string) => {
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title,
      targetGbp,
      currentGbp: 0,
      category
    };
    const saved = await saveSavingsGoal(newGoal);
    setSavings(prev => [...prev, saved]);
  };

  const onUpdateEstimate = async (estimate: LivingEstimate) => {
    const saved = await saveLivingEstimate(estimate);
    setEstimates(prev => prev.map(e => e.id === saved.id ? saved : e));
  };

  const onAddEstimate = async (category: string, amountGbp: number) => {
    const newEst: LivingEstimate = {
      id: `est-${Date.now()}`,
      category,
      amountGbp
    };
    const saved = await saveLivingEstimate(newEst);
    setEstimates(prev => [...prev, saved]);
  };

  const onUploadDocument = async (name: string, category: VaultDocument['category'], size: string, dataUrl?: string) => {
    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      name,
      category,
      fileSize: size,
      uploadDate: new Date().toISOString().split('T')[0],
      fileData: dataUrl
    };
    const saved = await saveDocument(newDoc);
    setDocuments(prev => [saved, ...prev]);
  };

  const onDeleteDocument = async (id: string) => {
    const success = await deleteDocument(id);
    if (success) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const onUpdateProfile = async (updated: UserProfile) => {
    const saved = await saveProfile(updated);
    setProfile(saved);
  };

  // Renting methods
  const onUpdateTenancyDetails = async (details: TenancyDetails) => {
    const saved = await saveTenancyDetails(details);
    setTenancyDetails(saved);
  };

  const onUpdateInventoryItems = async (items: InventoryItem[]) => {
    const saved = await saveInventoryItems(items);
    setInventoryItems(saved);
  };

  const onUpdateRentPayments = async (payments: RentPayment[]) => {
    const saved = await saveRentPayments(payments);
    setRentPayments(saved);
  };

  const onUpdateLandlordComms = async (comms: LandlordComm[]) => {
    const saved = await saveLandlordComms(comms);
    setLandlordComms(saved);
  };

  const onUpdateBillSplits = async (splits: BillSplit[]) => {
    const saved = await saveBillSplits(splits);
    setBillSplits(saved);
  };

  // Jobs methods
  const onSaveJobApplication = async (app: JobApplication) => {
    const saved = await saveJobApplication(app);
    setJobApplications(prev => {
      const idx = prev.findIndex(j => j.id === saved.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const onDeleteJobApplication = async (id: string) => {
    const success = await deleteJobApplication(id);
    if (success) {
      setJobApplications(prev => prev.filter(j => j.id !== id));
    }
  };

  // Health methods
  const onUpdateGPDetails = async (details: GPDetails) => {
    const saved = await saveGPDetails(details);
    setGpDetails(saved);
  };

  const onSavePrescription = async (p: Prescription) => {
    const saved = await savePrescription(p);
    setPrescriptions(prev => {
      const idx = prev.findIndex(x => x.id === saved.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const onDeletePrescription = async (id: string) => {
    const success = await deletePrescription(id);
    if (success) {
      setPrescriptions(prev => prev.filter(p => p.id !== id));
    }
  };

  const onSaveMedicalAppointment = async (app: MedicalAppointment) => {
    const saved = await saveMedicalAppointment(app);
    setAppointments(prev => {
      const idx = prev.findIndex(a => a.id === saved.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
  };

  const onDeleteMedicalAppointment = async (id: string) => {
    const success = await deleteMedicalAppointment(id);
    if (success) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  const onSaveEmergencyContact = async (c: EmergencyContact) => {
    const saved = await saveEmergencyContact(c);
    setEmergencyContacts(prev => {
      const idx = prev.findIndex(x => x.id === saved.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
  };

  const onDeleteEmergencyContact = async (id: string) => {
    const success = await deleteEmergencyContact(id);
    if (success) {
      setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <DashboardContext.Provider value={{
      loading, exchangeRate, rateSource, rateUpdatedAt, expenses, loanDetails, transactions, notes, events, savings, estimates, documents, profile,
      tenancyDetails, inventoryItems, rentPayments, landlordComms, billSplits, jobApplications, gpDetails, prescriptions, appointments, emergencyContacts,
      onRefreshRate, onAddExpense, onDeleteExpense, onAddLoanTransaction, onDeleteLoanTransaction, onUpdateLoanDetails, onSaveNote, onDeleteNote, onAddEvent, onDeleteEvent, onUpdateSavingsGoal, onAddSavingsGoal, onUpdateEstimate, onAddEstimate, onUploadDocument, onDeleteDocument, onUpdateProfile,
      onUpdateTenancyDetails, onUpdateInventoryItems, onUpdateRentPayments, onUpdateLandlordComms, onUpdateBillSplits,
      onSaveJobApplication, onDeleteJobApplication,
      onUpdateGPDetails, onSavePrescription, onDeletePrescription, onSaveMedicalAppointment, onDeleteMedicalAppointment, onSaveEmergencyContact, onDeleteEmergencyContact
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
