import * as seed from './mockData';
export const defaults = {
  expenses: seed.initialExpenses, loan_details: seed.initialLoanDetails, loan_transactions: seed.initialLoanTransactions,
  notes: seed.initialNotes, calendar_events: seed.initialCalendarEvents, savings_goals: seed.initialSavingsGoals,
  living_estimates: seed.initialLivingEstimates, documents: seed.initialDocuments, user_profile: seed.initialProfile,
  tenancy_details: seed.initialTenancyDetails, inventory_items: seed.initialInventoryItems, rent_payments: seed.initialRentPayments,
  landlord_comms: seed.initialLandlordComms, bill_splits: seed.initialBillSplits, job_applications: seed.initialJobApplications,
  gp_details: seed.initialGPDetails, prescriptions: seed.initialPrescriptions, medical_appointments: seed.initialMedicalAppointments,
  emergency_contacts: seed.initialEmergencyContacts,
};
export type RecordsData = typeof defaults;
export type Resource = keyof RecordsData;
export const resources = Object.keys(defaults) as Resource[];
export type TrashEntry = {recoveryId: string; resource: Resource; item: Record<string, unknown>; deletedAt: string};
export interface Snapshot {schemaVersion: 1; data: RecordsData; trash: TrashEntry[]}
export interface Backup extends Snapshot {app: 'UKOS'; exportedAt: string}
const fields: Record<Resource, Record<string, 'string' | 'number' | 'boolean' | 'array'>> = {
  expenses: {id:'string',title:'string',amountGbp:'number',amountInr:'number',category:'string',date:'string'},
  loan_details: {loanAmountInr:'number',interestRate:'number',tenureYears:'number',amountRepaidInr:'number'},
  loan_transactions: {id:'string',amountInr:'number',amountGbp:'number',date:'string',type:'string'},
  notes: {id:'string',title:'string',content:'string',category:'string',updatedAt:'string'},
  calendar_events: {id:'string',title:'string',date:'string',category:'string'},
  savings_goals: {id:'string',title:'string',targetGbp:'number',currentGbp:'number',category:'string'},
  living_estimates: {id:'string',category:'string',amountGbp:'number'},
  documents: {id:'string',name:'string',category:'string',fileSize:'string',uploadDate:'string'},
  user_profile: {fullName:'string',passportNo:'string',niNumber:'string',shareCode:'string',brpNumber:'string',nhsNumber:'string',ukPhone:'string'},
  tenancy_details: {rentAmountGbp:'number',depositAmountGbp:'number',depositSchemeRef:'string',dueDate:'string',landlordName:'string',landlordEmail:'string',landlordPhone:'string'},
  inventory_items: {id:'string',name:'string',status:'string',notes:'string'},
  rent_payments: {id:'string',month:'string',amountGbp:'number',status:'string'},
  landlord_comms: {id:'string',date:'string',type:'string',subject:'string',summary:'string'},
  bill_splits: {id:'string',name:'string',amountGbp:'number',splitWith:'array',paidBy:'string',status:'string'},
  job_applications: {id:'string',company:'string',role:'string',salaryGbp:'number',sponsorship:'string',status:'string',dateApplied:'string',cvLink:'string',notes:'string'},
  gp_details: {gpName:'string',gpAddress:'string',gpPhone:'string',gpEmail:'string',status:'string'},
  prescriptions: {id:'string',name:'string',dosage:'string',frequency:'string',repeat:'boolean',notes:'string'},
  medical_appointments: {id:'string',provider:'string',doctor:'string',date:'string',time:'string',reason:'string',notes:'string'},
  emergency_contacts: {id:'string',name:'string',relationship:'string',phone:'string'},
};
const enums: Partial<Record<Resource, Record<string, string[]>>> = {
  expenses:{category:['Rent','Food','Transport','Gym','Shopping','Travel','Entertainment','Bills','University']},
  loan_transactions:{type:['EMI','Extra Payment']}, notes:{category:['UK Life','University','Documents']},
  calendar_events:{category:['Urgent','Completed','University','Finance']},
  documents:{category:['Passport','Visa','CAS','Loan Letter','Insurance','University Documents','Other']},
  inventory_items:{status:['Fine','Needs Clean','Damaged']},rent_payments:{status:['Paid','Pending']},
  landlord_comms:{type:['Email','Call','Message','In Person']},bill_splits:{status:['Settled','Unsettled']},
  job_applications:{sponsorship:['Yes','No','Unsure'],status:['Applied','Shortlisted','Interview','Offered','Rejected']},
  gp_details:{status:['Registered','Pending','Not Registered']},medical_appointments:{provider:['GP','Dentist','Optician','Other']},
};
const optional: Partial<Record<Resource, string[]>> = {calendar_events:['description'], documents:['fileData'],user_profile:['pfp'],rent_payments:['datePaid'],emergency_contacts:['email']};
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function validItem(resource: Resource, value: unknown): boolean {
  if (!object(value)) return false;
  if (Object.keys(value).some(key => !Object.hasOwn(fields[resource],key) && !optional[resource]?.includes(key))) return false;
  return Object.entries(fields[resource]).every(([key,type]) => {
    const field = value[key];
    if (type === 'number') return typeof field === 'number' && Number.isFinite(field) && field >= 0;
    if (type === 'array') return Array.isArray(field) && field.every(item => typeof item === 'string');
    if (typeof field !== type) return false;
    if (key === 'id' && !field) return false;
    return !enums[resource]?.[key] || enums[resource]![key].includes(field as string);
  }) && (optional[resource] || []).every(key => value[key] === undefined || typeof value[key] === 'string');
}
export function validateSnapshot(value: unknown): asserts value is Snapshot {
  if (!object(value) || value.schemaVersion !== 1 || !object(value.data) || !Array.isArray(value.trash)) throw new Error('Unsupported or invalid UKOS backup.');
  if (Object.keys(value.data).length !== resources.length) throw new Error('Backup must contain every UKOS record collection.');
  for (const resource of resources) {
    const entry = value.data[resource];
    if (Array.isArray(defaults[resource])) {
      if (!Array.isArray(entry) || !entry.every(item => validItem(resource,item))) throw new Error(`Invalid ${resource} records.`);
      const ids = entry.map(item => item.id);
      if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${resource} record IDs.`);
    } else if (!validItem(resource,entry)) throw new Error(`Invalid ${resource} record.`);
  }
  if (!value.trash.every(item => object(item) && typeof item.recoveryId === 'string' && resources.includes(item.resource as Resource) && Array.isArray(defaults[item.resource as Resource]) && validItem(item.resource as Resource,item.item) && typeof item.deletedAt === 'string')) throw new Error('Invalid recovery records.');
  if (new Set(value.trash.map(item => item.recoveryId)).size !== value.trash.length) throw new Error('Duplicate recovery IDs.');
}
export function emptyData(): RecordsData {
  const result = structuredClone(defaults);
  for (const resource of resources) {
    if (Array.isArray(result[resource])) (result as Record<string, unknown>)[resource] = [];
    else {
      const entry = result[resource] as unknown as Record<string, unknown>;
      for (const key of Object.keys(entry)) entry[key] = typeof entry[key] === 'number' ? 0 : '';
    }
  }
  result.gp_details.status = 'Not Registered'; result.tenancy_details.dueDate = '1st'; result.user_profile.fullName = 'My UKOS';
  return result;
}
