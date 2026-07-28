import { ExpenseItem, ExpenseReport, ExpenseCategory } from '../types';

export async function parseExpensesFromText(
  rawText: string,
  month: string = 'July 2026',
  existingItems: ExpenseItem[] = []
): Promise<ExpenseReport> {
  let newItems: ExpenseItem[] = [];
  let apiTip: string | null = null;

  if (rawText.trim().length > 0) {
    try {
      const res = await fetch('/api/expenses/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, month, existingItems }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          newItems = data.items;
        }
        if (data.tip) {
          apiTip = data.tip;
        }
      }
    } catch (err) {
      console.warn('API call failed, falling back to local expense parsing heuristic:', err);
    }

    // Heuristic fallback if API returned no items or failed
    if (newItems.length === 0) {
      const entries = rawText.split(/[\n,;]+/).filter((e) => e.trim().length > 0);
      entries.forEach((entry, idx) => {
        const match = entry.match(/(.*?)\$?(\d+(?:\.\d{1,2})?)/);
        if (match) {
          let name = match[1].replace(/[-_:$]/g, ' ').trim();
          if (!name) name = 'Uncategorized Expense';
          const amount = parseFloat(match[2]);
          const nameLower = name.toLowerCase();

          let category: ExpenseCategory = 'Shopping/Other';
          if (
            nameLower.includes('food') ||
            nameLower.includes('grocery') ||
            nameLower.includes('dinner') ||
            nameLower.includes('lunch')
          ) {
            category = 'Food';
          } else if (
            nameLower.includes('bill') ||
            nameLower.includes('electric') ||
            nameLower.includes('water') ||
            nameLower.includes('rent')
          ) {
            category = 'Bills';
          } else if (
            nameLower.includes('uber') ||
            nameLower.includes('taxi') ||
            nameLower.includes('flight') ||
            nameLower.includes('gas')
          ) {
            category = 'Travel';
          }

          newItems.push({
            id: `parsed-${Date.now()}-${idx}`,
            title: name,
            amount,
            category,
            date: new Date().toISOString().split('T')[0],
          });
        }
      });
    }
  }

  const combinedItems = [...newItems, ...existingItems];
  if (combinedItems.length === 0) {
    combinedItems.push(
      { id: 'p-1', title: 'City Electric Utility', amount: 142.5, category: 'Bills', date: '2026-07-25' },
      { id: 'p-2', title: 'Organic Supermarket Groceries', amount: 185.2, category: 'Food', date: '2026-07-24' },
      { id: 'p-3', title: 'Monthly Subway Transit', amount: 90.0, category: 'Travel', date: '2026-07-22' },
      { id: 'p-4', title: 'Online Shopping Order', amount: 65.0, category: 'Shopping/Other', date: '2026-07-18' }
    );
  }

  const totals: Record<ExpenseCategory, number> = {
    Food: 0,
    Bills: 0,
    Travel: 0,
    'Shopping/Other': 0,
  };

  let totalSpend = 0;
  combinedItems.forEach((item) => {
    totals[item.category] += item.amount;
    totalSpend += item.amount;
  });

  const categoryColors: Record<ExpenseCategory, string> = {
    Food: '#A8E6CF',
    Bills: '#FF6B6B',
    Travel: '#4ECDC4',
    'Shopping/Other': '#FFE066',
  };

  const categoryBreakdown = (Object.keys(totals) as ExpenseCategory[]).map((cat) => {
    const amount = totals[cat];
    const percentage = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;
    return {
      category: cat,
      amount,
      percentage,
      color: categoryColors[cat],
    };
  });

  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  let tip = apiTip || "BILLS FORM OVER HALF OF THIS MONTH'S SPENDING";
  if (!apiTip) {
    const topCat = categoryBreakdown[0];
    if (topCat.category === 'Bills' && topCat.percentage >= 40) {
      tip = `BILLS ACCOUNT FOR ${topCat.percentage}% OF YOUR SPENDING THIS MONTH!`;
    } else if (topCat.category === 'Food') {
      tip = `FOOD & GROCERIES ARE YOUR LARGEST EXPENSE AT ${topCat.percentage}% OF TOTAL BUDGET`;
    } else {
      tip = `TOTAL SPENDING IS $${totalSpend.toFixed(2)} ACROSS ${combinedItems.length} ITEMS`;
    }
  }

  return {
    totalSpend,
    categoryBreakdown,
    tip,
    month,
    items: combinedItems,
  };
}
