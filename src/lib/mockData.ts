export interface Expense {
  id: string;
  title: string;
  amountGbp: number;
  amountInr: number;
  category: 'Rent' | 'Food' | 'Transport' | 'Gym' | 'Shopping' | 'Travel' | 'Entertainment' | 'Bills' | 'University';
  date: string;
}

export interface LoanDetails {
  loanAmountInr: number;
  interestRate: number; // e.g. 9.65
  tenureYears: number; // e.g. 6
  amountRepaidInr: number;
}

export interface LoanTransaction {
  id: string;
  amountInr: number;
  amountGbp: number;
  date: string;
  type: 'EMI' | 'Extra Payment';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'UK Life' | 'University' | 'Documents';
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: 'Urgent' | 'Completed' | 'University' | 'Finance';
  description?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetGbp: number;
  currentGbp: number;
  category: string;
}

export interface LivingEstimate {
  id: string;
  category: string;
  amountGbp: number;
}

export interface VaultDocument {
  id: string;
  name: string;
  category: 'Passport' | 'Visa' | 'CAS' | 'Loan Letter' | 'Insurance' | 'University Documents' | 'Other';
  fileSize: string;
  uploadDate: string;
  fileData?: string; // Base64 data url for preview/download
}

export const initialExpenses: Expense[] = [
  { id: '1', title: 'June Room Rent', amountGbp: 650, amountInr: 84123, category: 'Rent', date: '2026-06-01' },
  { id: '2', title: 'Tesco Weekly Groceries', amountGbp: 42.50, amountInr: 5500, category: 'Food', date: '2026-06-05' },
  { id: '3', title: 'Oyster Card Top-up', amountGbp: 25, amountInr: 3235, category: 'Transport', date: '2026-06-08' },
  { id: '4', title: 'Monthly Gym Membership', amountGbp: 32, amountInr: 4141, category: 'Gym', date: '2026-06-02' },
  { id: '5', title: 'Water & Electricity Bill', amountGbp: 80, amountInr: 10353, category: 'Bills', date: '2026-06-03' },
  { id: '6', title: 'MSc Textbooks & Printing', amountGbp: 55, amountInr: 7118, category: 'University', date: '2026-06-06' },
  { id: '7', title: 'Weekend Surrey Trip', amountGbp: 45, amountInr: 5823, category: 'Travel', date: '2026-06-07' },
  { id: '8', title: 'Pret A Manger Coffee', amountGbp: 8.50, amountInr: 1100, category: 'Food', date: '2026-06-09' },
  { id: '9', title: 'Cinema with Classmates', amountGbp: 15, amountInr: 1941, category: 'Entertainment', date: '2026-06-10' }
];

export const initialLoanDetails: LoanDetails = {
  loanAmountInr: 4000000,
  interestRate: 9.65,
  tenureYears: 6,
  amountRepaidInr: 350000
};

export const initialLoanTransactions: LoanTransaction[] = [
  { id: 'lt-1', amountInr: 68000, amountGbp: 526, date: '2026-03-10', type: 'EMI' },
  { id: 'lt-2', amountInr: 68000, amountGbp: 525, date: '2026-04-10', type: 'EMI' },
  { id: 'lt-3', amountInr: 68000, amountGbp: 526, date: '2026-05-10', type: 'EMI' },
  { id: 'lt-4', amountInr: 146000, amountGbp: 1128, date: '2026-06-05', type: 'Extra Payment' }
];

export const initialNotes: Note[] = [
  {
    id: 'n-1',
    title: 'UK Life Essentials',
    content: `### Essential Setup Steps
- **NI Number**: Call 0800 141 2075. Applied on 2026-09-15. Status: Awaiting physical letter.
- **GP Registration**: Surrey Health Centre (GP). Registered online. Bring BRP for validation.
- **Bank Account**: Opened Revolut for daily spend & Lloyds for loan disbursals. BRP/CAS letters uploaded successfully.
- **Student Oyster Card**: 30% discount on London transit. Applied with Surrey Student ID.`,
    category: 'UK Life',
    updatedAt: '2026-06-09'
  },
  {
    id: 'n-2',
    title: 'MSc Modules & Contacts',
    content: `### Term 1 Modules
1. **COM3001: Advanced AI Architectures**
   - Professor: Dr. Adrian Vance (a.vance@surrey.ac.uk)
   - Lectures: Monday 10am - 12pm, Room A3
   - Assignment 1: 30% due November 12th.
2. **COM3002: Cloud Computing & Systems**
   - Professor: Dr. Sarah Jenkins (s.jenkins@surrey.ac.uk)
   - Lab Session: Wednesday 2pm - 5pm, IT Lab 2`,
    category: 'University',
    updatedAt: '2026-06-11'
  },
  {
    id: 'n-3',
    title: 'Important Documents Tracker',
    content: `### Document Checklist
- **BRP (Biometric Residence Permit)**: Collected from Guildford Post Office on arrival. Keep safe or scan in Document Vault.
- **Visa Vignette**: Valid until Oct 2026.
- **CAS Letter**: Surrey reference CAS-8947293-UK.
- **TB Test & Health Insurance**: IHS paid for 2 years (£1,550).`,
    category: 'Documents',
    updatedAt: '2026-06-08'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  { id: 'ce-1', title: 'Rent Payment Due (£650)', date: '2026-07-01', category: 'Finance', description: 'Standing order to landlord' },
  { id: 'ce-2', title: 'AI Assignment 1 Due (30%)', date: '2026-06-25', category: 'Urgent', description: 'Submit via Surrey Learn portal' },
  { id: 'ce-3', title: 'Part-time Shift: Library Assistant', date: '2026-06-15', category: 'University', description: '12:00 - 16:00, Campus Library' },
  { id: 'ce-4', title: 'GP Induction Appointment', date: '2026-06-18', category: 'Completed', description: 'Surrey Health Centre checkup' },
  { id: 'ce-5', title: 'Education Loan EMI Disbursal', date: '2026-06-10', category: 'Finance', description: '₹68,000 auto-debited' },
  { id: 'ce-6', title: 'Exam: Cloud Computing Systems', date: '2026-06-29', category: 'Urgent', description: 'Online exam hall 1' }
];

export const initialSavingsGoals: SavingsGoal[] = [
  { id: 'sg-1', title: 'Emergency Fund', targetGbp: 1500, currentGbp: 650, category: 'Survival' },
  { id: 'sg-2', title: 'Graduation Euro Trip', targetGbp: 2000, currentGbp: 400, category: 'Leisure' },
  { id: 'sg-3', title: 'Next Term Tuition Reserve', targetGbp: 5000, currentGbp: 1450, category: 'Education' }
];

export const initialLivingEstimates: LivingEstimate[] = [
  { id: 'le-1', category: 'Rent', amountGbp: 650 },
  { id: 'le-2', category: 'Food', amountGbp: 200 },
  { id: 'le-3', category: 'Transport', amountGbp: 70 },
  { id: 'le-4', category: 'Bills', amountGbp: 80 },
  { id: 'le-5', category: 'Gym & Leisure', amountGbp: 40 },
  { id: 'le-6', category: 'Study Materials', amountGbp: 30 }
];

export const initialDocuments: VaultDocument[] = [
  { id: 'doc-1', name: 'Passport_Scan_Main.pdf', category: 'Passport', fileSize: '1.2 MB', uploadDate: '2026-06-01' },
  { id: 'doc-2', name: 'UK_Student_Visa_BRP.png', category: 'Visa', fileSize: '850 KB', uploadDate: '2026-06-01' },
  { id: 'doc-3', name: 'University_CAS_Surrey.pdf', category: 'CAS', fileSize: '420 KB', uploadDate: '2026-06-02' },
  { id: 'doc-4', name: 'SBI_Education_Loan_Sanction.pdf', category: 'Loan Letter', fileSize: '2.4 MB', uploadDate: '2026-06-03' }
];

export interface UserProfile {
  fullName: string;
  pfp?: string; // base64 PFP
  passportNo: string;
  niNumber: string;
  shareCode: string;
  brpNumber: string;
  nhsNumber: string;
  ukPhone: string;
}

export const initialProfile: UserProfile = {
  fullName: 'NITTHIN',
  passportNo: 'A12345678',
  niNumber: 'QQ 12 34 56 C',
  shareCode: 'W12-345-678',
  brpNumber: 'BRP98765432',
  nhsNumber: '123-456-7890',
  ukPhone: '+44 7700 900077'
};

// ==========================================
// RENTING & TENANCY VAULT
// ==========================================

export interface TenancyDetails {
  rentAmountGbp: number;
  depositAmountGbp: number;
  depositSchemeRef: string;
  dueDate: string; // Day of the month, e.g. "1st"
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  status: 'Fine' | 'Needs Clean' | 'Damaged';
  notes: string;
}

export interface RentPayment {
  id: string;
  month: string; // e.g. "June 2026"
  amountGbp: number;
  datePaid?: string;
  status: 'Paid' | 'Pending';
}

export interface LandlordComm {
  id: string;
  date: string;
  type: 'Email' | 'Call' | 'Message' | 'In Person';
  subject: string;
  summary: string;
}

export interface BillSplit {
  id: string;
  name: string;
  amountGbp: number;
  splitWith: string[]; // List of names
  paidBy: string;
  status: 'Settled' | 'Unsettled';
}

export const initialTenancyDetails: TenancyDetails = {
  rentAmountGbp: 650,
  depositAmountGbp: 750,
  depositSchemeRef: 'TDS-98741-UK',
  dueDate: '1st',
  landlordName: 'Guildford Lettings Ltd (Agent: John)',
  landlordEmail: 'john@guildfordlettings.co.uk',
  landlordPhone: '+44 1483 555666'
};

export const initialInventoryItems: InventoryItem[] = [
  { id: 'inv-1', name: 'Double Bed Frame & Mattress', status: 'Fine', notes: 'Checked, no visible stains.' },
  { id: 'inv-2', name: 'Living Room Carpet', status: 'Needs Clean', notes: 'Grey stain near the window frame.' },
  { id: 'inv-3', name: 'Microwave & Oven', status: 'Fine', notes: 'Both clean and fully functioning.' },
  { id: 'inv-4', name: 'Study Desk Chair', status: 'Damaged', notes: 'Left armrest is slightly loose.' }
];

export const initialRentPayments: RentPayment[] = [
  { id: 'rp-1', month: 'June 2026', amountGbp: 650, datePaid: '2026-06-01', status: 'Paid' },
  { id: 'rp-2', month: 'July 2026', amountGbp: 650, status: 'Pending' }
];

export const initialLandlordComms: LandlordComm[] = [
  { id: 'lc-1', date: '2026-06-02', type: 'Email', subject: 'Tenancy Deposit Receipt', summary: 'Agent confirmed deposit placed in Custodial Scheme.' },
  { id: 'lc-2', date: '2026-06-05', type: 'Call', subject: 'Key handover appointment', summary: 'Arranged to pick up keys from agency on the 10th.' }
];

export const initialBillSplits: BillSplit[] = [
  { id: 'bs-1', name: 'Broadband (June)', amountGbp: 30, splitWith: ['Alice', 'Bob'], paidBy: 'Alice', status: 'Unsettled' },
  { id: 'bs-2', name: 'Gas & Electric (June)', amountGbp: 120, splitWith: ['Alice', 'Bob'], paidBy: 'NITTHIN', status: 'Unsettled' }
];

// ==========================================
// JOB & INTERNSHIP KANBAN BOARD
// ==========================================

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salaryGbp: number;
  sponsorship: 'Yes' | 'No' | 'Unsure';
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Offered' | 'Rejected';
  dateApplied: string;
  cvLink: string;
  notes: string;
}

export const initialJobApplications: JobApplication[] = [
  { 
    id: 'job-1', 
    company: 'Google UK', 
    role: 'Software Engineer Intern', 
    salaryGbp: 45000, 
    sponsorship: 'Yes', 
    status: 'Shortlisted', 
    dateApplied: '2026-06-01', 
    cvLink: 'UK Life Essentials', 
    notes: 'Completed Online Assessment. Recruiter screen scheduled.' 
  },
  { 
    id: 'job-2', 
    company: 'Revolut', 
    role: 'Junior Frontend Engineer', 
    salaryGbp: 52000, 
    sponsorship: 'Yes', 
    status: 'Interview', 
    dateApplied: '2026-06-03', 
    cvLink: 'Important Documents Tracker', 
    notes: 'Technical panel interview on React and design patterns.' 
  },
  { 
    id: 'job-3', 
    company: 'Guildford Local Shop', 
    role: 'Part-Time Cashier', 
    salaryGbp: 12.50, 
    sponsorship: 'No', 
    status: 'Applied', 
    dateApplied: '2026-06-10', 
    cvLink: '', 
    notes: 'Dropped CV in-person to manager. Allowed 20 hrs max.' 
  }
];

// ==========================================
// NHS GP & HEALTH LOG
// ==========================================

export interface GPDetails {
  gpName: string;
  gpAddress: string;
  gpPhone: string;
  gpEmail: string;
  status: 'Registered' | 'Pending' | 'Not Registered';
}

export interface Prescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  repeat: boolean;
  notes: string;
}

export interface MedicalAppointment {
  id: string;
  provider: 'GP' | 'Dentist' | 'Optician' | 'Other';
  doctor: string;
  date: string;
  time: string;
  reason: string;
  notes: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export const initialGPDetails: GPDetails = {
  gpName: 'Surrey Health Centre',
  gpAddress: 'Uni of Surrey Campus, Guildford, GU2 7XH',
  gpPhone: '+44 1483 682293',
  gpEmail: 'gp-surrey@nhs.net',
  status: 'Registered'
};

export const initialPrescriptions: Prescription[] = [
  { id: 'pr-1', name: 'Cetirizine 10mg', dosage: '1 tablet daily', frequency: 'Once a day', repeat: true, notes: 'For UK pollen hayfever allergies.' }
];

export const initialMedicalAppointments: MedicalAppointment[] = [
  { 
    id: 'ma-1', 
    provider: 'GP', 
    doctor: 'Dr. Elizabeth Finch', 
    date: '2026-06-18', 
    time: '14:30', 
    reason: 'Initial student health checkup and record validation.', 
    notes: 'Remember to carry printed copy of immunization records.' 
  }
];

export const initialEmergencyContacts: EmergencyContact[] = [
  { id: 'ec-1', name: 'Parents (Home Country)', relationship: 'Father/Mother', phone: '+91 98765 43210' },
  { id: 'ec-2', name: 'University Campus Security', relationship: 'Uni Security Office', phone: '+44 1483 689133', email: 'security@surrey.ac.uk' }
];

