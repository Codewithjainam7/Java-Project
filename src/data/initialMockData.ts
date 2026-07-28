import { Reminder, LetterTemplate, SavedDraft, ExpenseItem, NoticeItem, UserSettings } from '../types';

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Electricity & Utility Bill',
    amount: 142.50,
    dueDate: '2026-08-02',
    category: 'Bills',
    status: 'DUE SOON',
    description: 'City Power Corp account #98421. Auto-debit fails if balance under $150.',
    createdDate: '2026-07-25',
  },
  {
    id: 'rem-2',
    title: 'Apartment Rent Payment',
    amount: 1850.00,
    dueDate: '2026-08-01',
    category: 'Rent',
    status: 'DUE SOON',
    description: 'August rent for Unit 4B. Wire transfer to landlord bank account.',
    createdDate: '2026-07-20',
  },
  {
    id: 'rem-3',
    title: 'Car Insurance Renewal',
    amount: 320.00,
    dueDate: '2026-07-24',
    category: 'Insurance',
    status: 'OVERDUE',
    description: 'Policy #NX-48291 renewal payment. Grace period ends Aug 5.',
    createdDate: '2026-07-10',
  },
  {
    id: 'rem-4',
    title: 'Gym Membership Subscription',
    amount: 49.99,
    dueDate: '2026-08-15',
    category: 'Subscriptions',
    status: 'PENDING',
    description: 'Monthly active pass at Metro Fitness Club.',
    createdDate: '2026-07-15',
  },
  {
    id: 'rem-5',
    title: 'Quarterly Water & Sewage',
    amount: 88.20,
    dueDate: '2026-07-12',
    category: 'Bills',
    status: 'PAID',
    description: 'Municipal water bill for Q2. Paid via banking app.',
    createdDate: '2026-07-01',
  }
];

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Landlord Complaint',
    iconName: 'Home',
    description: 'Formal request to fix structural issues, water leaks, or appliance repairs.',
    category: 'Housing',
    fields: [
      { key: 'landlordName', label: 'Landlord / Property Manager Name', placeholder: 'e.g. Mr. Robert Smith' },
      { key: 'propertyAddress', label: 'Property Address & Unit #', placeholder: 'e.g. Apt 4B, 128 Maple Street' },
      { key: 'issueType', label: 'Issue Description', placeholder: 'e.g. Plumbing leak under kitchen sink causing mold' },
      { key: 'desiredDeadline', label: 'Deadline for Repair', placeholder: 'e.g. Within 5 business days (Aug 3)' }
    ]
  },
  {
    id: 'tpl-2',
    title: 'Leave Application',
    iconName: 'Calendar',
    description: 'Official notice for leave from office or educational institution.',
    category: 'Work/School',
    fields: [
      { key: 'managerName', label: 'Manager / Supervisor Name', placeholder: 'e.g. Sarah Jenkins' },
      { key: 'startDate', label: 'Start Date', placeholder: 'YYYY-MM-DD', type: 'date' },
      { key: 'endDate', label: 'End Date', placeholder: 'YYYY-MM-DD', type: 'date' },
      { key: 'reason', label: 'Reason for Leave', placeholder: 'e.g. Personal family emergency / Medical appointment' },
      { key: 'handoverContact', label: 'Emergency or Handover Contact', placeholder: 'e.g. Alex Johnson (alex@company.com)' }
    ]
  },
  {
    id: 'tpl-3',
    title: 'Society Request',
    iconName: 'Building',
    description: 'Request for parking allocation, elevator booking, or facility maintenance.',
    category: 'Community',
    fields: [
      { key: 'committeeName', label: 'Society / HOA Committee Name', placeholder: 'e.g. Sunview Heights Resident Association' },
      { key: 'residentUnit', label: 'Your Apartment / House Number', placeholder: 'e.g. Flat 602, Tower B' },
      { key: 'requestDetails', label: 'Request / Permisson Needed', placeholder: 'e.g. Reserve service elevator for furniture delivery on Aug 5' }
    ]
  },
  {
    id: 'tpl-4',
    title: 'Job Application Follow-up',
    iconName: 'Briefcase',
    description: 'Polite inquiry regarding interview outcome or application status.',
    category: 'Career',
    fields: [
      { key: 'recruiterName', label: 'Hiring Manager / Recruiter Name', placeholder: 'e.g. David Miller' },
      { key: 'positionTitle', label: 'Job Position Name', placeholder: 'e.g. Senior Frontend Developer' },
      { key: 'interviewDate', label: 'Date of Last Contact / Interview', placeholder: 'e.g. July 18th, 2026' }
    ]
  }
];

export const INITIAL_SAVED_DRAFTS: SavedDraft[] = [
  {
    id: 'draft-1',
    templateId: 'tpl-1',
    templateTitle: 'Landlord Complaint',
    date: '2026-07-26',
    inputs: {
      landlordName: 'Mr. Robert Smith',
      propertyAddress: 'Apt 4B, 128 Maple Street',
      issueType: 'Persistent water leakage in master bathroom ceiling',
      desiredDeadline: 'August 1st, 2026'
    },
    generatedText: `Dear Mr. Robert Smith,

Re: Urgent Notice regarding Persistent Water Leakage at Apt 4B, 128 Maple Street.

I am writing to formally alert you regarding a serious maintenance issue in Apt 4B. There is a persistent water leakage in the master bathroom ceiling that has begun worsening over the past week.

As this poses a potential health and safety hazard, I kindly request that a licensed technician inspect and resolve this repair by August 1st, 2026.

Thank you for your prompt attention to this matter.

Sincerely,
Jane Doe
Tenant, Apt 4B`
  },
  {
    id: 'draft-2',
    templateId: 'tpl-2',
    templateTitle: 'Leave Application',
    date: '2026-07-22',
    inputs: {
      managerName: 'Sarah Jenkins',
      startDate: '2026-08-10',
      endDate: '2026-08-14',
      reason: 'Family wedding attendance out of state',
      handoverContact: 'Alex Johnson (alex@company.com)'
    },
    generatedText: `Subject: Formal Leave Application: Aug 10 - Aug 14 (Jane Doe)

Dear Sarah Jenkins,

I am writing to request approval for annual leave starting from August 10, 2026, through August 14, 2026, as I will be attending a family wedding out of state.

During my absence, Alex Johnson (alex@company.com) has kindly agreed to cover my critical daily tasks. I will ensure all ongoing projects are updated before my departure.

Thank you for your consideration.

Warm regards,
Jane Doe`
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'exp-1', title: 'City Power Utility Bill', amount: 142.50, category: 'Bills', date: '2026-07-25' },
  { id: 'exp-2', title: 'Whole Foods Market Grocery', amount: 185.20, category: 'Food', date: '2026-07-24' },
  { id: 'exp-3', title: 'Monthly Subway Pass', amount: 90.00, category: 'Travel', date: '2026-07-22' },
  { id: 'exp-4', title: 'Dinner with Colleagues', amount: 68.40, category: 'Food', date: '2026-07-20' },
  { id: 'exp-5', title: 'Water & Sewage Quarterly', amount: 88.20, category: 'Bills', date: '2026-07-15' },
  { id: 'exp-6', title: 'Uber Ride to Airport', amount: 42.10, category: 'Travel', date: '2026-07-10' },
  { id: 'exp-7', title: 'Work Desk Accessories', amount: 75.00, category: 'Shopping/Other', date: '2026-07-08' },
];

export const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'not-1',
    title: 'Property Tax Revision & Municipal Assessment',
    date: '2026-07-26',
    source: 'City Revenue & Taxation Dept',
    summaryParagraph: 'The Municipal Revenue Department has reassessed local residential tax rates for Q3 2026. Residential property owners are eligible for a 5% early payment rebate if cleared before August 25th, after which a 2% monthly late charge applies.',
    actionPoints: [
      { id: 'ap-1', text: 'Verify updated property pin number on city tax portal', completed: true },
      { id: 'ap-2', text: 'Pay early tax assessment before August 25 to claim 5% discount', completed: false },
      { id: 'ap-3', text: 'Download and archive official digital payment receipt', completed: false }
    ],
    rawText: 'NOTICE OF REVISED PROPERTY TAX ASSESSMENT (Q3 2026). Pursuant to Section 14-B of Municipal Code, property values have been adjusted. Payment received before August 25 qualifies for 5% incentive deduction.'
  },
  {
    id: 'not-2',
    title: 'Building Water Mains Maintenance Shutdown',
    date: '2026-07-20',
    source: 'Sunview Management Office',
    summaryParagraph: 'Scheduled plumbing overhaul will temporarily disrupt water supply in Towers A and B on Thursday, August 6th between 09:00 AM and 04:00 PM. Residents should store emergency water.',
    actionPoints: [
      { id: 'ap-4', text: 'Store 20 liters of household water before 9:00 AM on Aug 6', completed: true },
      { id: 'ap-5', text: 'Keep main washing machines and dishwashers powered down during shutdown', completed: false }
    ],
    rawText: 'MAINTENANCE ANNOUNCEMENT: Water shutoff scheduled for Aug 6th from 9 AM to 4 PM for valve replacements.'
  }
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  displayName: 'Jane Doe',
  email: 'jane.doe@example.com',
  language: 'English',
  notificationChannel: 'Email'
};
