export type ReminderStatus = 'PENDING' | 'DUE SOON' | 'OVERDUE' | 'PAID';

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: 'Bills' | 'Subscriptions' | 'Rent' | 'Insurance' | 'Tax' | 'Other';
  status: ReminderStatus;
  description?: string;
  createdDate: string;
}

export interface LetterTemplateField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea' | 'date';
}

export interface LetterTemplate {
  id: string;
  title: string;
  iconName: string;
  description: string;
  category: string;
  fields: LetterTemplateField[];
}

export interface SavedDraft {
  id: string;
  templateId: string;
  templateTitle: string;
  date: string;
  inputs: Record<string, string>;
  generatedText: string;
}

export type ExpenseCategory = 'Food' | 'Bills' | 'Travel' | 'Shopping/Other';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string; // hex
}

export interface ExpenseReport {
  totalSpend: number;
  categoryBreakdown: CategoryBreakdown[];
  tip: string;
  month: string;
  items: ExpenseItem[];
}

export interface ActionPoint {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  source: string;
  summaryParagraph: string;
  actionPoints: ActionPoint[];
  rawText?: string;
}

export interface UserSettings {
  displayName: string;
  email: string;
  language: 'English' | 'Hindi' | 'Marathi';
  notificationChannel: 'Email' | 'SMS' | 'Both';
}
