import React, { useState, useEffect } from 'react';
import { ExpenseItem, ExpenseReport, ExpenseCategory } from '../types';
import { parseExpensesFromText } from '../services/mockExpenseParser';
import { PasteInputCard } from '../components/PasteInputCard';
import { CategoryProgressBar } from '../components/CategoryProgressBar';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  PieChart,
  DollarSign,
  Tag,
  PlusCircle,
  Trash2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface ExpenseOrganizerPageProps {
  expenses: ExpenseItem[];
  onAddExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onSetAllExpenses: (items: ExpenseItem[]) => void;
}

export const ExpenseOrganizerPage: React.FC<ExpenseOrganizerPageProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onSetAllExpenses,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('July 2026');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ExpenseReport | null>(null);

  // Manual new expense input
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Food');

  const sampleExpenseTexts = [
    {
      label: 'Weekly Receipts Snippet',
      text: 'Grocery Store $185.20, City Electricity $142.50, Subway Monthly Pass $90.00, Coffee & Lunch $28.50',
    },
    {
      label: 'Monthly Utilities & Shopping',
      text: 'Apartment Water $88.20, Gasoline $45.00, Online Desk Lamp $75.00, Dinner with Friends $68.40',
    },
  ];

  // Re-calculate report whenever expenses or month changes
  const updateReport = async (items: ExpenseItem[], month: string) => {
    const res = await parseExpensesFromText('', month, items);
    setReport(res);
  };

  useEffect(() => {
    updateReport(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  const handleParseText = async (text: string) => {
    setIsLoading(true);
    try {
      const res = await parseExpensesFromText(text, selectedMonth, expenses);
      setReport(res);
      onSetAllExpenses(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const amountNum = parseFloat(newAmount) || 0;
    const item: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: newTitle,
      amount: amountNum,
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
    };

    onAddExpense(item);
    setNewTitle('');
    setNewAmount('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#4ECDC4] border-4 border-black p-5 md:p-6 shadow-[6px_6px_0_#111111]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading text-xs font-black uppercase bg-black text-[#4ECDC4] px-2 py-0.5">
                MODULE 3
              </span>
              <span className="font-heading text-xs font-bold uppercase text-black">
                EXPENSE ORGANIZER
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black">
              RAW EXPENSE PARSER & CATEGORIZER
            </h1>
            <p className="font-medium text-black/90 text-sm mt-1">
              Paste unformatted expenditure text or receipts. The system calculates category percentages and spending tips.
            </p>
          </div>

          {/* Month Selector Dropdown */}
          <div className="bg-white border-3 border-black p-2 shadow-[3px_3px_0_#111111] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-heading text-xs font-black uppercase bg-transparent outline-none text-black cursor-pointer"
            >
              <option value="July 2026">JULY 2026</option>
              <option value="August 2026">AUGUST 2026</option>
              <option value="September 2026">SEPTEMBER 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paste Input Card */}
      <PasteInputCard
        title="PASTE RAW EXPENSE OR RECEIPT TEXT"
        placeholder="e.g. 'Grocery $120.50, Electric bill $85.00, Dinner $45.00, Uber $18.00...'"
        onSubmit={handleParseText}
        isLoading={isLoading}
        sampleTexts={sampleExpenseTexts}
        buttonText="PARSE EXPENSES & CATEGORIZE"
      />

      {/* Loading state */}
      {isLoading && <LoadingState message="CATEGORIZING EXPENSES & CALCULATING BUDGET..." />}

      {/* Report Section */}
      {report && !isLoading && (
        <div className="space-y-6">
          {/* Total Spend Metric Card */}
          <div className="bg-[#FFE066] border-4 border-black p-6 shadow-[6px_6px_0_#111111] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-heading text-xs font-black uppercase bg-black text-[#FFE066] px-2 py-0.5">
                TOTAL SPEND • {selectedMonth.toUpperCase()}
              </span>
              <div className="font-heading text-4xl md:text-5xl font-black text-black mt-2">
                ${report.totalSpend.toFixed(2)}
              </div>
            </div>

            {/* Sticker Style Tip Badge */}
            <div className="bg-white border-3 border-black p-3 shadow-[4px_4px_0_#111111] max-w-md">
              <div className="flex items-center gap-2 text-xs font-heading font-black text-[#FF3B3B] mb-1">
                <Sparkles className="w-4 h-4 stroke-[3]" />
                INSIGHT TIP STICKER
              </div>
              <p className="font-heading text-sm font-extrabold uppercase text-black">
                "{report.tip}"
              </p>
            </div>
          </div>

          {/* Category Breakdown Progress Bars */}
          <div className="nb-card p-5 md:p-6 bg-white">
            <h2 className="font-heading text-lg font-black uppercase text-black border-b-3 border-black pb-3 mb-6">
              CATEGORY BREAKDOWN ({report.categoryBreakdown.length} CATEGORIES)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.categoryBreakdown.map((cat) => (
                <CategoryProgressBar
                  key={cat.category}
                  label={cat.category}
                  amount={cat.amount}
                  percentage={cat.percentage}
                  color={cat.color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Expense Addition Form */}
      <div className="nb-card p-5 bg-[#FFF9EC] border-3 border-black">
        <h3 className="font-heading text-base font-black uppercase text-black mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-black stroke-[2.5]" />
          ADD SINGLE EXPENSE MANUALLY
        </h3>

        <form onSubmit={handleManualAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Item Description"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="nb-input text-xs"
          />

          <input
            type="number"
            step="0.01"
            required
            placeholder="Amount ($)"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="nb-input text-xs"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
            className="nb-input text-xs font-bold bg-white"
          >
            <option value="Food">Food (Mint)</option>
            <option value="Bills">Bills (Coral)</option>
            <option value="Travel">Travel (Teal)</option>
            <option value="Shopping/Other">Shopping/Other (Yellow)</option>
          </select>

          <button type="submit" className="nb-btn text-xs py-2">
            ADD ITEM
          </button>
        </form>
      </div>

      {/* Parsed Expense Items Table */}
      <div className="nb-card p-5 md:p-6 bg-white">
        <h2 className="font-heading text-lg font-black uppercase text-black border-b-3 border-black pb-3 mb-4">
          ITEMIZED EXPENSE LOG ({expenses.length} ITEMS)
        </h2>

        {expenses.length === 0 ? (
          <EmptyState
            title="NO EXPENSES RECORDED"
            message="Paste expenses above or add them manually to generate budget analytics."
            icon={<PieChart className="w-8 h-8 stroke-[2.5]" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-3 border-black border-collapse text-left">
              <thead>
                <tr className="bg-[#FFE066] border-b-3 border-black font-heading text-xs font-black uppercase">
                  <th className="p-3 border-r-2 border-black">DESCRIPTION</th>
                  <th className="p-3 border-r-2 border-black">CATEGORY</th>
                  <th className="p-3 border-r-2 border-black">DATE</th>
                  <th className="p-3 border-r-2 border-black text-right">AMOUNT</th>
                  <th className="p-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-sm font-semibold">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF9EC]">
                    <td className="p-3 border-r-2 border-black font-bold text-black">
                      {item.title}
                    </td>
                    <td className="p-3 border-r-2 border-black">
                      <span className="font-heading text-[11px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0_#111111]" style={{
                        backgroundColor: item.category === 'Food' ? '#A8E6CF' : item.category === 'Bills' ? '#FF6B6B' : item.category === 'Travel' ? '#4ECDC4' : '#FFE066'
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 border-r-2 border-black text-xs text-gray-700">
                      {item.date}
                    </td>
                    <td className="p-3 border-r-2 border-black text-right font-heading font-black text-black">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        className="nb-btn nb-btn-coral p-1 text-xs"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
