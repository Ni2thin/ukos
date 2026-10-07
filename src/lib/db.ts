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

import { getEngine } from './storage';
export { supabase } from './storage';
import { resources, type RecordsData, type Resource } from './storage-schema';
const KEYS = Object.fromEntries(resources.map(key => [key.toUpperCase(), `ukos_${key}`])) as Record<string,string>;
KEYS.PROFILE = 'ukos_user_profile';
KEYS.EXCHANGE_RATE = 'ukos_exchange_rate';
const resourceFor = (key:string) => key.replace(/^ukos_/, '') as Resource;
function getItem<T>(key:string, fallback:T):T {
  if(key===KEYS.EXCHANGE_RATE){const stored=localStorage.getItem(key);return stored?JSON.parse(stored):fallback;}
  return getEngine().get(resourceFor(key)) as T;
}
function setItem<T>(key:string,value:T) {
  if(key===KEYS.EXCHANGE_RATE){localStorage.setItem(key,JSON.stringify(value));return;}
  getEngine().mutate(data => {(data as Record<string,unknown>)[resourceFor(key)]=value;});
}
async function safeGet<T>(_queryFn:unknown,key:string,_default:T[]):Promise<T[]>{return getItem<T[]>(key,_default);}
async function safeGetSingle<T>(_queryFn:unknown,key:string,_default:T):Promise<T>{return getItem<T>(key,_default);}
async function safeSaveList<T>(_queryFn:unknown,key:string,items:T[]):Promise<T[]>{
  getEngine().replaceList(resourceFor(key),items as unknown as RecordsData[Resource]);return items;
}
async function safeSaveSingleInList<T extends {id:string}>(_queryFn:unknown,key:string,fallback:T[],item:T,prepend=true):Promise<T>{
  const current=getItem<T[]>(key,fallback);const filtered=current.filter(entry=>entry.id!==item.id);
  setItem(key,prepend?[item,...filtered]:[...filtered,item]);return item;
}
async function safeSaveSingle<T>(_queryFn:unknown,key:string,value:T):Promise<T>{setItem(key,value);return value;}
async function safeDeleteFromList<T extends {id:string}>(_queryFn:unknown,key:string,fallback:T[],id:string):Promise<boolean>{
  const current=getItem<T[]>(key,fallback);getEngine().replaceList(resourceFor(key),current.filter(item=>item.id!==id) as unknown as RecordsData[Resource]);return true;
}

// EXPENSES CRUD
export async function getExpenses(): Promise<Expense[]> {
  return safeGet<Expense>(
    null,
    KEYS.EXPENSES,
    initialExpenses
  );
}

export async function saveExpense(expense: Expense): Promise<Expense> {
  return safeSaveSingleInList<Expense>(
    null,
    KEYS.EXPENSES,
    initialExpenses,
    expense,
    true
  );
}

export async function deleteExpense(id: string): Promise<boolean> {
  return safeDeleteFromList<Expense>(
    null,
    KEYS.EXPENSES,
    initialExpenses,
    id
  );
}

// LOAN DETAILS
export async function getLoanDetails(): Promise<LoanDetails> {
  return safeGetSingle<LoanDetails>(
    null,
    KEYS.LOAN_DETAILS,
    initialLoanDetails
  );
}

export async function saveLoanDetails(details: LoanDetails): Promise<LoanDetails> {
  return safeSaveSingle<LoanDetails>(
    null,
    KEYS.LOAN_DETAILS,
    details
  );
}

// LOAN TRANSACTIONS
export async function getLoanTransactions(): Promise<LoanTransaction[]> {
  return safeGet<LoanTransaction>(
    null,
    KEYS.LOAN_TRANSACTIONS,
    initialLoanTransactions
  );
}

export async function saveLoanTransaction(tx: LoanTransaction): Promise<LoanTransaction> {
  getEngine().mutate(data => {
    if(data.loan_transactions.some(item=>item.id===tx.id))throw new Error('Payment already recorded.');
    data.loan_transactions.unshift(tx);
    data.loan_details.amountRepaidInr += tx.amountInr;
  });
  return tx;
}

export async function deleteLoanTransaction(id: string): Promise<boolean> {
  getEngine().mutate((data,trash) => {
    const tx=data.loan_transactions.find(item=>item.id===id);
    if(!tx)return;
    trash.push({recoveryId:crypto.randomUUID(),resource:'loan_transactions',item:{...tx},deletedAt:new Date().toISOString()});
    data.loan_transactions=data.loan_transactions.filter(item=>item.id!==id);
    data.loan_details.amountRepaidInr=Math.max(0,data.loan_details.amountRepaidInr-tx.amountInr);
  });
  return true;
}

// NOTES CRUD
export async function getNotes(): Promise<Note[]> {
  return safeGet<Note>(
    null,
    KEYS.NOTES,
    initialNotes
  );
}

export async function saveNote(note: Note): Promise<Note> {
  return safeSaveSingleInList<Note>(
    null,
    KEYS.NOTES,
    initialNotes,
    note,
    true
  );
}

export async function deleteNote(id: string): Promise<boolean> {
  return safeDeleteFromList<Note>(
    null,
    KEYS.NOTES,
    initialNotes,
    id
  );
}

// CALENDAR EVENTS CRUD
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return safeGet<CalendarEvent>(
    null,
    KEYS.CALENDAR_EVENTS,
    initialCalendarEvents
  );
}

export async function saveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  return safeSaveSingleInList<CalendarEvent>(
    null,
    KEYS.CALENDAR_EVENTS,
    initialCalendarEvents,
    event,
    false
  );
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  return safeDeleteFromList<CalendarEvent>(
    null,
    KEYS.CALENDAR_EVENTS,
    initialCalendarEvents,
    id
  );
}

// SAVINGS GOALS CRUD
export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return safeGet<SavingsGoal>(
    null,
    KEYS.SAVINGS_GOALS,
    initialSavingsGoals
  );
}

export async function saveSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
  return safeSaveSingleInList<SavingsGoal>(
    null,
    KEYS.SAVINGS_GOALS,
    initialSavingsGoals,
    goal,
    false
  );
}

// LIVING ESTIMATES
export async function getLivingEstimates(): Promise<LivingEstimate[]> {
  return safeGet<LivingEstimate>(
    null,
    KEYS.LIVING_ESTIMATES,
    initialLivingEstimates
  );
}

export async function saveLivingEstimate(estimate: LivingEstimate): Promise<LivingEstimate> {
  return safeSaveSingleInList<LivingEstimate>(
    null,
    KEYS.LIVING_ESTIMATES,
    initialLivingEstimates,
    estimate,
    false
  );
}

// DOCUMENTS VAULT CRUD
export async function getDocuments(): Promise<VaultDocument[]> {
  return safeGet<VaultDocument>(
    null,
    KEYS.DOCUMENTS,
    initialDocuments
  );
}

export async function saveDocument(doc: VaultDocument): Promise<VaultDocument> {
  return safeSaveSingleInList<VaultDocument>(
    null,
    KEYS.DOCUMENTS,
    initialDocuments,
    doc,
    true
  );
}

export async function deleteDocument(id: string): Promise<boolean> {
  return safeDeleteFromList<VaultDocument>(
    null,
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
    null,
    KEYS.PROFILE,
    initialProfile
  );
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  return safeSaveSingle<UserProfile>(
    null,
    KEYS.PROFILE,
    profile
  );
}

// ==========================================
// RENTING & TENANCY VAULT
// ==========================================

export async function getTenancyDetails(): Promise<TenancyDetails> {
  return safeGetSingle<TenancyDetails>(
    null,
    KEYS.TENANCY_DETAILS,
    initialTenancyDetails
  );
}

export async function saveTenancyDetails(details: TenancyDetails): Promise<TenancyDetails> {
  return safeSaveSingle<TenancyDetails>(
    null,
    KEYS.TENANCY_DETAILS,
    details
  );
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return safeGet<InventoryItem>(
    null,
    KEYS.INVENTORY_ITEMS,
    initialInventoryItems
  );
}

export async function saveInventoryItems(items: InventoryItem[]): Promise<InventoryItem[]> {
  return safeSaveList<InventoryItem>(
    null,
    KEYS.INVENTORY_ITEMS,
    items
  );
}

export async function getRentPayments(): Promise<RentPayment[]> {
  return safeGet<RentPayment>(
    null,
    KEYS.RENT_PAYMENTS,
    initialRentPayments
  );
}

export async function saveRentPayments(payments: RentPayment[]): Promise<RentPayment[]> {
  return safeSaveList<RentPayment>(
    null,
    KEYS.RENT_PAYMENTS,
    payments
  );
}

export async function getLandlordComms(): Promise<LandlordComm[]> {
  return safeGet<LandlordComm>(
    null,
    KEYS.LANDLORD_COMMS,
    initialLandlordComms
  );
}

export async function saveLandlordComms(comms: LandlordComm[]): Promise<LandlordComm[]> {
  return safeSaveList<LandlordComm>(
    null,
    KEYS.LANDLORD_COMMS,
    comms
  );
}

export async function getBillSplits(): Promise<BillSplit[]> {
  return safeGet<BillSplit>(
    null,
    KEYS.BILL_SPLITS,
    initialBillSplits
  );
}

export async function saveBillSplits(splits: BillSplit[]): Promise<BillSplit[]> {
  return safeSaveList<BillSplit>(
    null,
    KEYS.BILL_SPLITS,
    splits
  );
}

// ==========================================
// JOB & INTERNSHIP KANBAN BOARD
// ==========================================

export async function getJobApplications(): Promise<JobApplication[]> {
  return safeGet<JobApplication>(
    null,
    KEYS.JOB_APPLICATIONS,
    initialJobApplications
  );
}

export async function saveJobApplication(app: JobApplication): Promise<JobApplication> {
  return safeSaveSingleInList<JobApplication>(
    null,
    KEYS.JOB_APPLICATIONS,
    initialJobApplications,
    app,
    true
  );
}

export async function deleteJobApplication(id: string): Promise<boolean> {
  return safeDeleteFromList<JobApplication>(
    null,
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
    null,
    KEYS.GP_DETAILS,
    initialGPDetails
  );
}

export async function saveGPDetails(details: GPDetails): Promise<GPDetails> {
  return safeSaveSingle<GPDetails>(
    null,
    KEYS.GP_DETAILS,
    details
  );
}

export async function getPrescriptions(): Promise<Prescription[]> {
  return safeGet<Prescription>(
    null,
    KEYS.PRESCRIPTIONS,
    initialPrescriptions
  );
}

export async function savePrescription(p: Prescription): Promise<Prescription> {
  return safeSaveSingleInList<Prescription>(
    null,
    KEYS.PRESCRIPTIONS,
    initialPrescriptions,
    p,
    true
  );
}

export async function deletePrescription(id: string): Promise<boolean> {
  return safeDeleteFromList<Prescription>(
    null,
    KEYS.PRESCRIPTIONS,
    initialPrescriptions,
    id
  );
}

export async function getMedicalAppointments(): Promise<MedicalAppointment[]> {
  return safeGet<MedicalAppointment>(
    null,
    KEYS.MEDICAL_APPOINTMENTS,
    initialMedicalAppointments
  );
}

export async function saveMedicalAppointment(app: MedicalAppointment): Promise<MedicalAppointment> {
  return safeSaveSingleInList<MedicalAppointment>(
    null,
    KEYS.MEDICAL_APPOINTMENTS,
    initialMedicalAppointments,
    app,
    false
  );
}

export async function deleteMedicalAppointment(id: string): Promise<boolean> {
  return safeDeleteFromList<MedicalAppointment>(
    null,
    KEYS.MEDICAL_APPOINTMENTS,
    initialMedicalAppointments,
    id
  );
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return safeGet<EmergencyContact>(
    null,
    KEYS.EMERGENCY_CONTACTS,
    initialEmergencyContacts
  );
}

export async function saveEmergencyContact(c: EmergencyContact): Promise<EmergencyContact> {
  return safeSaveSingleInList<EmergencyContact>(
    null,
    KEYS.EMERGENCY_CONTACTS,
    initialEmergencyContacts,
    c,
    false
  );
}

export async function deleteEmergencyContact(id: string): Promise<boolean> {
  return safeDeleteFromList<EmergencyContact>(
    null,
    KEYS.EMERGENCY_CONTACTS,
    initialEmergencyContacts,
    id
  );
}
