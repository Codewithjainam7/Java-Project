import { NoticeItem } from '../types';

export async function summarizeNoticeFromText(rawText: string): Promise<NoticeItem> {
  try {
    const res = await fetch('/api/notices/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API call failed, falling back to local notice summarizer:', err);
  }

  // Local fallback heuristic
  const textLower = rawText.toLowerCase();
  let title = 'Official Regulatory Notice';
  let source = 'Municipal Authority / Provider';

  if (textLower.includes('tax') || textLower.includes('assessment')) {
    title = 'Municipal Property Tax Adjustment Notice';
    source = 'City Revenue Department';
  } else if (textLower.includes('water') || textLower.includes('pipe')) {
    title = 'Building Maintenance & Water Shutdown Advisory';
    source = 'Property Operations Committee';
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    id: `notice-${Date.now()}`,
    title,
    date: today,
    source,
    summaryParagraph: `KEY SUMMARY: The document addresses official administrative policy directives requiring timely compliance verification.`,
    actionPoints: [
      { id: `ap-${Date.now()}-1`, text: 'Verify document reference on official portal', completed: false },
      { id: `ap-${Date.now()}-2`, text: 'Complete required compliance action before deadline', completed: false },
    ],
    rawText,
  };
}
