import { Reminder } from '../types';

export interface ExtractionResult {
  title: string;
  amount: number | null;
  dueDate: string | null;
  category: Reminder['category'];
  description: string;
  incomplete: boolean;
  warningMessage?: string;
}

export async function extractReminderFromText(
  rawText: string,
  forceIncomplete: boolean = false
): Promise<ExtractionResult> {
  try {
    const res = await fetch('/api/reminders/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, forceIncomplete }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API call failed, falling back to local extraction handler:', err);
  }

  // Fallback heuristic if backend is unreachable
  const textLower = rawText.toLowerCase();

  if (forceIncomplete || textLower.includes('incomplete') || textLower.includes('vague')) {
    return {
      title: 'Scanned Document Notice',
      amount: null,
      dueDate: null,
      category: 'Bills',
      description: rawText || 'Unclear text snippet from uploaded document.',
      incomplete: true,
      warningMessage: "COULDN'T READ EVERYTHING — CHECK THE FIELDS BELOW",
    };
  }

  let category: Reminder['category'] = 'Bills';
  if (textLower.includes('rent') || textLower.includes('lease') || textLower.includes('landlord')) {
    category = 'Rent';
  } else if (textLower.includes('gym') || textLower.includes('netflix') || textLower.includes('spotify')) {
    category = 'Subscriptions';
  } else if (textLower.includes('insurance') || textLower.includes('policy')) {
    category = 'Insurance';
  } else if (textLower.includes('tax') || textLower.includes('irs')) {
    category = 'Tax';
  }

  const amountMatch = rawText.match(/\$?(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 115.0;

  let title = 'Extracted Bill Reminder';
  if (rawText.length > 0) {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    title = lines[0].substring(0, 45);
    if (!title.toLowerCase().includes('bill') && !title.toLowerCase().includes('reminder')) {
      title += ' Notice';
    }
  }

  const today = new Date();
  today.setDate(today.getDate() + 7);
  const dueDate = today.toISOString().split('T')[0];

  return {
    title,
    amount,
    dueDate,
    category,
    description: rawText.length > 60 ? rawText.substring(0, 150) + '...' : rawText,
    incomplete: false,
  };
}
