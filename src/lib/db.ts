import { createClient } from '@supabase/supabase-js';
import {
  Expense,
  LoanDetails,
  LoanTransaction,
  Note,
  CalendarEvent,
  SavingsGoal,
  LivingEstimate,
  VaultDocument,
  UserProfile,
  initialExpenses,
  initialLoanDetails,
  initialLoanTransactions,
  initialNotes,
  initialCalendarEvents,
  initialSavingsGoals,
  initialLivingEstimates,
  initialDocuments,
  initialProfile,
  TenancyDetails,
  InventoryItem,
  RentPayment,
  LandlordComm,
  BillSplit,
  JobApplication,
  GPDetails,
  Prescription,
  MedicalAppointment,
  EmergencyContact,
  initialTenancyDetails,
  initialInventoryItems,
  initialRentPayments,
  initialLandlordComms,
  initialBillSplits,
  initialJobApplications,
  initialGPDetails,
  initialPrescriptions,
  initialMedicalAppointments,
  initialEmergencyContacts
} from './mockData';

export type {
  Expense,
  LoanDetails,
  LoanTransaction,
  Note,
  CalendarEvent,
  SavingsGoal,
  LivingEstimate,
  VaultDocument,
  UserProfile,
  TenancyDetails,
  InventoryItem,
  RentPayment,
  LandlordComm,
  BillSplit,
  JobApplication,
  GPDetails,
  Prescription,
  MedicalAppointment,
  EmergencyContact
};

// Initialize Supabase Client if env variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Storage Helper keys
const KEYS = {
  EXPENSES: 'ukos_expenses',
  LOAN_DETAILS: 'ukos_loan_details',
  LOAN_TRANSACTIONS: 'ukos_loan_transactions',
  NOTES: 'ukos_notes',
  CALENDAR_EVENTS: 'ukos_calendar_events',
  SAVINGS_GOALS: 'ukos_savings_goals',
  LIVING_ESTIMATES: 'ukos_living_estimates',
  DOCUMENTS: 'ukos_documents',
  EXCHANGE_RATE: 'ukos_exchange_rate',
  PROFILE: 'ukos_user_profile',
  TENANCY_DETAILS: 'ukos_tenancy_details',
  INVENTORY_ITEMS: 'ukos_inventory_items',
  RENT_PAYMENTS: 'ukos_rent_payments',
  LANDLORD_COMMS: 'ukos_landlord_comms',
  BILL_SPLITS: 'ukos_bill_splits',
  JOB_APPLICATIONS: 'ukos_job_applications',
  GP_DETAILS: 'ukos_gp_details',
  PRESCRIPTIONS: 'ukos_prescriptions',
  MEDICAL_APPOINTMENTS: 'ukos_medical_appointments',
  EMERGENCY_CONTACTS: 'ukos_emergency_contacts'
};

const isBrowser = typeof window !== 'undefined';

// Safe localStorage wrapper
function getItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Catch-all Query Helpers for Supabase with automatic LocalStorage caching and resilient error recovery
async function safeGet<T>(
  queryFn: () => PromiseLike<any>,
  localStorageKey: string,
  defaultValue: T[]
): Promise<T[]> {
  if (supabase) {
    try {
      const { data, error } = await queryFn();
      if (!error && data !== null) {
        setItem(localStorageKey, data);
        return data;
      }
      if (error) console.warn(`Supabase get error for ${localStorageKey}:`, error);
    } catch (err) {
      console.error(`Supabase get exception for ${localStorageKey}:`, err);
    }
  }
  return getItem<T[]>(localStorageKey, defaultValue);
}

async function safeGetSingle<T>(
  queryFn: () => PromiseLike<any>,
  localStorageKey: string,
  defaultValue: T
): Promise<T> {
  if (supabase) {
    try {
      const { data, error } = await queryFn();
      if (!error && data !== null) {
        setItem(localStorageKey, data);
        return data;
      }
      if (error) console.warn(`Supabase getSingle error for ${localStorageKey}:`, error);
    } catch (err) {
      console.error(`Supabase getSingle exception for ${localStorageKey}:`, err);
    }
  }
  return getItem<T>(localStorageKey, defaultValue);
}

async function safeSaveList<T>(
  queryFn: () => PromiseLike<any>,
  localStorageKey: string,
  items: T[]
): Promise<T[]> {
  if (supabase) {
    try {
      const { error } = await queryFn();
      if (!error) {
        setItem(localStorageKey, items);
        return items;
      }
      console.warn(`Supabase saveList error for ${localStorageKey}:`, error);
    } catch (err) {
      console.error(`Supabase saveList exception for ${localStorageKey}:`, err);
    }
  }
  setItem(localStorageKey, items);
  return items;
}

async function safeSaveSingleInList<T extends { id: string }>(
  queryFn: () => PromiseLike<any>,
  localStorageKey: string,
  defaultValue: T[],
  item: T,
  prepend = true
): Promise<T> {
  if (supabase) {
    try {
      const { data, error } = await queryFn();
      if (!error && data) {
        const current = getItem<T[]>(localStorageKey, defaultValue);
        const filtered = current.filter(x => x.id !== item.id);
        const updated = prepend ? [data, ...filtered] : [...filtered, data];
        setItem(localStorageKey, updated);
        return data;
      }
      console.warn(`Supabase saveSingleInList error for ${localStorageKey}:`, error);
    } catch (err) {
      console.error(`Supabase saveSingleInList exception for ${localStorageKey}:`, err);
    }
  }
  const current = getItem<T[]>(localStorageKey, defaultValue);
  const index = current.findIndex(x => x.id === item.id);
  let updated;
  if (index !== -1) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = prepend ? [item, ...current] : [...current, item];
  }
  setItem(localStorageKey, updated);
  return item;
}

async function safeSaveSingle<T>(
  queryFn: () => PromiseLike<any>,
  localStorageKey: string,
  data: T
): Promise<T> {
  if (supabase) {
    try {
      const { error } = await queryFn();
      if (!error) {
        setItem(localStorageKey, data);
        return data;
      }
      console.warn(`Supabase saveSingle error for ${localStorageKey}:`, error);
    } catch (err) {
      console.error(`Supabase saveSingle exception for ${localStorageKey}:`, err);
    }
  }
  setItem(localStorageKey, data);
  return data;
}

async function safeDeleteFromList<T extends { id: string }>(
  queryFn: () => PromiseLike<any>,
  localStorageKey: string,
  defaultValue: T[],
  id: string
): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await queryFn();
      if (!error) {
        const current = getItem<T[]>(localStorageKey, defaultValue);
        const updated = current.filter(x => x.id !== id);
        setItem(localStorageKey, updated);
        return true;
      }
      console.warn(`Supabase delete error for ${localStorageKey}:`, error);
    } catch (err) {
      console.error(`Supabase delete exception for ${localStorageKey}:`, err);
    }
  }
  const current = getItem<T[]>(localStorageKey, defaultValue);
  const updated = current.filter(x => x.id !== id);
  setItem(localStorageKey, updated);
  return true;
}

// EXPENSES CRUD
export async function getExpenses(): Promise<Expense[]> {
  return safeGet<Expense>(
    () => supabase!.from('expenses').select('*').order('date', { ascending: false }),
    KEYS.EXPENSES,
    initialExpenses
  );
}

export async function saveExpense(expense: Expense): Promise<Expense> {
  return safeSaveSingleInList<Expense>(
    () => supabase!.from('expenses').insert(expense).select().single(),
    KEYS.EXPENSES,
    initialExpenses,
    expense,
    true
  );
}

export async function deleteExpense(id: string): Promise<boolean> {
  return safeDeleteFromList<Expense>(
    () => supabase!.from('expenses').delete().eq('id', id),
    KEYS.EXPENSES,
    initialExpenses,
    id
  );
}

// LOAN DETAILS
export async function getLoanDetails(): Promise<LoanDetails> {
  return safeGetSingle<LoanDetails>(
    () => supabase!.from('loan_details').select('*').limit(1).maybeSingle(),
    KEYS.LOAN_DETAILS,
    initialLoanDetails
  );
}

export async function saveLoanDetails(details: LoanDetails): Promise<LoanDetails> {
  return safeSaveSingle<LoanDetails>(
    () => supabase!.from('loan_details').upsert(details),
    KEYS.LOAN_DETAILS,
    details
  );
}

// LOAN TRANSACTIONS
export async function getLoanTransactions(): Promise<LoanTransaction[]> {
  return safeGet<LoanTransaction>(
    () => supabase!.from('loan_transactions').select('*').order('date', { ascending: false }),
    KEYS.LOAN_TRANSACTIONS,
    initialLoanTransactions
  );
}

export async function saveLoanTransaction(tx: LoanTransaction): Promise<LoanTransaction> {
  const saved = await safeSaveSingleInList<LoanTransaction>(
    () => supabase!.from('loan_transactions').insert(tx).select().single(),
    KEYS.LOAN_TRANSACTIONS,
    initialLoanTransactions,
    tx,
    true
  );
  
  try {
    const loanDetails = await getLoanDetails();
    loanDetails.amountRepaidInr += tx.amountInr;
    await saveLoanDetails(loanDetails);
  } catch (err) {
    console.error('Failed to update loan details repayment amount:', err);
  }

  return saved;
}

export async function deleteLoanTransaction(id: string): Promise<boolean> {
  let txToDelete: LoanTransaction | undefined;
  
  try {
    if (supabase) {
      const { data } = await supabase.from('loan_transactions').select('*').eq('id', id).maybeSingle();
      if (data) txToDelete = data as LoanTransaction;
    }
  } catch (err) {
    console.warn('Failed to fetch transaction from Supabase before delete:', err);
  }
  
  if (!txToDelete) {
    const current = getItem<LoanTransaction[]>(KEYS.LOAN_TRANSACTIONS, initialLoanTransactions);
    txToDelete = current.find(t => t.id === id);
  }

  const success = await safeDeleteFromList<LoanTransaction>(
    () => supabase!.from('loan_transactions').delete().eq('id', id),
    KEYS.LOAN_TRANSACTIONS,
    initialLoanTransactions,
    id
  );

  if (success && txToDelete) {
    try {
      const loanDetails = await getLoanDetails();
      loanDetails.amountRepaidInr = Math.max(0, loanDetails.amountRepaidInr - txToDelete.amountInr);
      await saveLoanDetails(loanDetails);
    } catch (err) {
      console.error('Failed to update loan details repayment amount after delete:', err);
    }
  }

  return success;
}

// NOTES CRUD
export async function getNotes(): Promise<Note[]> {
  return safeGet<Note>(
    () => supabase!.from('notes').select('*').order('updatedAt', { ascending: false }),
    KEYS.NOTES,
    initialNotes
  );
}

export async function saveNote(note: Note): Promise<Note> {
  return safeSaveSingleInList<Note>(
    () => supabase!.from('notes').upsert(note).select().single(),
    KEYS.NOTES,
    initialNotes,
    note,
    true
  );
}

export async function deleteNote(id: string): Promise<boolean> {
  return safeDeleteFromList<Note>(
    () => supabase!.from('notes').delete().eq('id', id),
    KEYS.NOTES,
    initialNotes,
    id
  );
}

// CALENDAR EVENTS CRUD
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return safeGet<CalendarEvent>(
    () => supabase!.from('calendar_events').select('*').order('date', { ascending: true }),
    KEYS.CALENDAR_EVENTS,
    initialCalendarEvents
  );
}

export async function saveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  return safeSaveSingleInList<CalendarEvent>(
    () => supabase!.from('calendar_events').insert(event).select().single(),
    KEYS.CALENDAR_EVENTS,
    initialCalendarEvents,
    event,
    false
  );
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  return safeDeleteFromList<CalendarEvent>(
    () => supabase!.from('calendar_events').delete().eq('id', id),
    KEYS.CALENDAR_EVENTS,
    initialCalendarEvents,
    id
  );
}

// SAVINGS GOALS CRUD
export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return safeGet<SavingsGoal>(
    () => supabase!.from('savings_goals').select('*'),
    KEYS.SAVINGS_GOALS,
    initialSavingsGoals
  );
}

export async function saveSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
  return safeSaveSingleInList<SavingsGoal>(
    () => supabase!.from('savings_goals').upsert(goal).select().single(),
    KEYS.SAVINGS_GOALS,
    initialSavingsGoals,
    goal,
    false
  );
}

// LIVING ESTIMATES
export async function getLivingEstimates(): Promise<LivingEstimate[]> {
  return safeGet<LivingEstimate>(
    () => supabase!.from('living_estimates').select('*'),
    KEYS.LIVING_ESTIMATES,
    initialLivingEstimates
  );
}

export async function saveLivingEstimate(estimate: LivingEstimate): Promise<LivingEstimate> {
  return safeSaveSingleInList<LivingEstimate>(
    () => supabase!.from('living_estimates').upsert(estimate).select().single(),
    KEYS.LIVING_ESTIMATES,
    initialLivingEstimates,
    estimate,
    false
  );
}

// DOCUMENTS VAULT CRUD
export async function getDocuments(): Promise<VaultDocument[]> {
  return safeGet<VaultDocument>(
    () => supabase!.from('documents').select('*').order('uploadDate', { ascending: false }),
    KEYS.DOCUMENTS,
    initialDocuments
  );
}

export async function saveDocument(doc: VaultDocument): Promise<VaultDocument> {
  return safeSaveSingleInList<VaultDocument>(
    () => supabase!.from('documents').insert(doc).select().single(),
    KEYS.DOCUMENTS,
    initialDocuments,
    doc,
    true
  );
}

export async function deleteDocument(id: string): Promise<boolean> {
  return safeDeleteFromList<VaultDocument>(
    () => supabase!.from('documents').delete().eq('id', id),
    KEYS.DOCUMENTS,
    initialDocuments,
    id
  );
}

// EXCHANGE RATE
export function getStoredExchangeRate(): { rate: number; updatedAt: number } {
  const defaultVal = { rate: 129.42, updatedAt: Date.now() - 3600 * 1000 };
  return getItem(KEYS.EXCHANGE_RATE, defaultVal);
}

export function saveStoredExchangeRate(rate: number): void {
  setItem(KEYS.EXCHANGE_RATE, { rate, updatedAt: Date.now() });
}

// PROFILE
export async function getProfile(): Promise<UserProfile> {
  return safeGetSingle<UserProfile>(
    () => supabase!.from('profiles').select('*').limit(1).maybeSingle(),
    KEYS.PROFILE,
    initialProfile
  );
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  return safeSaveSingle<UserProfile>(
    () => supabase!.from('profiles').upsert(profile),
    KEYS.PROFILE,
    profile
  );
}

// ==========================================
// RENTING & TENANCY VAULT
// ==========================================

export async function getTenancyDetails(): Promise<TenancyDetails> {
  return safeGetSingle<TenancyDetails>(
    () => supabase!.from('tenancy_details').select('*').limit(1).maybeSingle(),
    KEYS.TENANCY_DETAILS,
    initialTenancyDetails
  );
}

export async function saveTenancyDetails(details: TenancyDetails): Promise<TenancyDetails> {
  return safeSaveSingle<TenancyDetails>(
    () => supabase!.from('tenancy_details').upsert(details),
    KEYS.TENANCY_DETAILS,
    details
  );
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return safeGet<InventoryItem>(
    () => supabase!.from('inventory_items').select('*'),
    KEYS.INVENTORY_ITEMS,
    initialInventoryItems
  );
}

export async function saveInventoryItems(items: InventoryItem[]): Promise<InventoryItem[]> {
  return safeSaveList<InventoryItem>(
    () => supabase!.from('inventory_items').upsert(items),
    KEYS.INVENTORY_ITEMS,
    items
  );
}

export async function getRentPayments(): Promise<RentPayment[]> {
  return safeGet<RentPayment>(
    () => supabase!.from('rent_payments').select('*').order('month', { ascending: true }),
    KEYS.RENT_PAYMENTS,
    initialRentPayments
  );
}

export async function saveRentPayments(payments: RentPayment[]): Promise<RentPayment[]> {
  return safeSaveList<RentPayment>(
    () => supabase!.from('rent_payments').upsert(payments),
    KEYS.RENT_PAYMENTS,
    payments
  );
}

export async function getLandlordComms(): Promise<LandlordComm[]> {
  return safeGet<LandlordComm>(
    () => supabase!.from('landlord_comms').select('*').order('date', { ascending: false }),
    KEYS.LANDLORD_COMMS,
    initialLandlordComms
  );
}

export async function saveLandlordComms(comms: LandlordComm[]): Promise<LandlordComm[]> {
  return safeSaveList<LandlordComm>(
    () => supabase!.from('landlord_comms').upsert(comms),
    KEYS.LANDLORD_COMMS,
    comms
  );
}

export async function getBillSplits(): Promise<BillSplit[]> {
  return safeGet<BillSplit>(
    () => supabase!.from('bill_splits').select('*'),
    KEYS.BILL_SPLITS,
    initialBillSplits
  );
}

export async function saveBillSplits(splits: BillSplit[]): Promise<BillSplit[]> {
  return safeSaveList<BillSplit>(
    () => supabase!.from('bill_splits').upsert(splits),
    KEYS.BILL_SPLITS,
    splits
  );
}

// ==========================================
// JOB & INTERNSHIP KANBAN BOARD
// ==========================================

export async function getJobApplications(): Promise<JobApplication[]> {
  return safeGet<JobApplication>(
    () => supabase!.from('job_applications').select('*').order('dateApplied', { ascending: false }),
    KEYS.JOB_APPLICATIONS,
    initialJobApplications
  );
}

export async function saveJobApplication(app: JobApplication): Promise<JobApplication> {
  return safeSaveSingleInList<JobApplication>(
    () => supabase!.from('job_applications').upsert(app).select().single(),
    KEYS.JOB_APPLICATIONS,
    initialJobApplications,
    app,
    true
  );
}

export async function deleteJobApplication(id: string): Promise<boolean> {
  return safeDeleteFromList<JobApplication>(
    () => supabase!.from('job_applications').delete().eq('id', id),
    KEYS.JOB_APPLICATIONS,
    initialJobApplications,
    id
  );
}

// ==========================================
// NHS GP & HEALTH LOG
// ==========================================

export async function getGPDetails(): Promise<GPDetails> {
  return safeGetSingle<GPDetails>(
    () => supabase!.from('gp_details').select('*').limit(1).maybeSingle(),
    KEYS.GP_DETAILS,
    initialGPDetails
  );
}

export async function saveGPDetails(details: GPDetails): Promise<GPDetails> {
  return safeSaveSingle<GPDetails>(
    () => supabase!.from('gp_details').upsert(details),
    KEYS.GP_DETAILS,
    details
  );
}

export async function getPrescriptions(): Promise<Prescription[]> {
  return safeGet<Prescription>(
    () => supabase!.from('prescriptions').select('*'),
    KEYS.PRESCRIPTIONS,
    initialPrescriptions
  );
}

export async function savePrescription(p: Prescription): Promise<Prescription> {
  return safeSaveSingleInList<Prescription>(
    () => supabase!.from('prescriptions').upsert(p).select().single(),
    KEYS.PRESCRIPTIONS,
    initialPrescriptions,
    p,
    true
  );
}

export async function deletePrescription(id: string): Promise<boolean> {
  return safeDeleteFromList<Prescription>(
    () => supabase!.from('prescriptions').delete().eq('id', id),
    KEYS.PRESCRIPTIONS,
    initialPrescriptions,
    id
  );
}

export async function getMedicalAppointments(): Promise<MedicalAppointment[]> {
  return safeGet<MedicalAppointment>(
    () => supabase!.from('medical_appointments').select('*').order('date', { ascending: true }),
    KEYS.MEDICAL_APPOINTMENTS,
    initialMedicalAppointments
  );
}

export async function saveMedicalAppointment(app: MedicalAppointment): Promise<MedicalAppointment> {
  return safeSaveSingleInList<MedicalAppointment>(
    () => supabase!.from('medical_appointments').upsert(app).select().single(),
    KEYS.MEDICAL_APPOINTMENTS,
    initialMedicalAppointments,
    app,
    false
  );
}

export async function deleteMedicalAppointment(id: string): Promise<boolean> {
  return safeDeleteFromList<MedicalAppointment>(
    () => supabase!.from('medical_appointments').delete().eq('id', id),
    KEYS.MEDICAL_APPOINTMENTS,
    initialMedicalAppointments,
    id
  );
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return safeGet<EmergencyContact>(
    () => supabase!.from('emergency_contacts').select('*'),
    KEYS.EMERGENCY_CONTACTS,
    initialEmergencyContacts
  );
}

export async function saveEmergencyContact(c: EmergencyContact): Promise<EmergencyContact> {
  return safeSaveSingleInList<EmergencyContact>(
    () => supabase!.from('emergency_contacts').upsert(c).select().single(),
    KEYS.EMERGENCY_CONTACTS,
    initialEmergencyContacts,
    c,
    false
  );
}

export async function deleteEmergencyContact(id: string): Promise<boolean> {
  return safeDeleteFromList<EmergencyContact>(
    () => supabase!.from('emergency_contacts').delete().eq('id', id),
    KEYS.EMERGENCY_CONTACTS,
    initialEmergencyContacts,
    id
  );
}
