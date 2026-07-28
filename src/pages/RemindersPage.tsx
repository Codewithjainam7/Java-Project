import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Reminder, ReminderStatus } from '../types';
import { extractReminderFromText, ExtractionResult } from '../services/mockReminderExtraction';
import { PasteInputCard } from '../components/PasteInputCard';
import { ResultCard } from '../components/ResultCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorBanner } from '../components/ErrorBanner';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import {
  Bell,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Filter,
  AlertTriangle,
} from 'lucide-react';

interface RemindersPageProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onUpdateReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Editable fields in result card
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState<number | string>('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCategory, setEditCategory] = useState<Reminder['category']>('Bills');

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    if (location.state?.prefillNoticeText) {
      handleAnalyze(location.state.prefillNoticeText);
    }
  }, [location.state]);

  const sampleBills = [
    {
      label: 'Electricity Bill Notice',
      text: 'City Electric Utility Account #98421. Total Due: $142.50 by August 2nd, 2026. Please remit payment via bank transfer.',
    },
    {
      label: 'Apartment Rent Invoice',
      text: 'Monthly Rent Invoice for Unit 4B. Amount payable: $1,850.00. Payment due date: August 1st, 2026.',
    },
    {
      label: 'Vague / Incomplete Snippet',
      text: 'Notice regarding upcoming service fee update. Please check portal for details.',
    },
  ];

  const handleAnalyze = async (text: string, forceIncomplete?: boolean) => {
    setIsLoading(true);
    setExtractedData(null);
    setShowWarning(false);

    try {
      const result = await extractReminderFromText(text, forceIncomplete);
      setExtractedData(result);
      if (result.incomplete) {
        setShowWarning(true);
      }
      setEditTitle(result.title);
      setEditAmount(result.amount !== null ? result.amount : '');
      setEditDueDate(result.dueDate || new Date().toISOString().split('T')[0]);
      setEditCategory(result.category);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExtracted = () => {
    if (!editTitle.trim()) return;

    const amountNum = typeof editAmount === 'number' ? editAmount : parseFloat(editAmount as string) || 0;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: editTitle,
      amount: amountNum,
      dueDate: editDueDate || new Date().toISOString().split('T')[0],
      category: editCategory,
      status: 'DUE SOON',
      createdDate: new Date().toISOString().split('T')[0],
    };

    onAddReminder(newReminder);
    setExtractedData(null);
    setShowWarning(false);
  };

  const handleDiscardExtracted = () => {
    setExtractedData(null);
    setShowWarning(false);
  };

  const handleTogglePaid = (reminder: Reminder) => {
    const nextStatus: ReminderStatus = reminder.status === 'PAID' ? 'PENDING' : 'PAID';
    onUpdateReminder({ ...reminder, status: nextStatus });
  };

  const filteredReminders = reminders.filter((r) => {
    if (filterCategory === 'ALL') return true;
    return r.category.toUpperCase() === filterCategory;
  });

  // Sort by due date
  const sortedReminders = [...filteredReminders].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#FFE066] border-4 border-black p-5 md:p-6 shadow-[6px_6px_0_#111111]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-xs font-black uppercase bg-black text-[#FFE066] px-2 py-0.5">
            MODULE 1
          </span>
          <span className="font-heading text-xs font-bold uppercase text-black">
            SMART REMINDERS
          </span>
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black">
          AUTOMATED BILL & DUE DATE EXTRACTOR
        </h1>
        <p className="font-medium text-black/80 text-sm mt-1">
          Paste any raw bill snippet, email notification, or invoice text. The copilot extracts structured fields automatically.
        </p>
      </div>

      {/* Paste Input Card */}
      <PasteInputCard
        title="PASTE BILL OR INVOICE TEXT"
        placeholder="Paste text like: 'City Power Corp Bill $142.50 due Aug 2nd account #98421...'"
        onSubmit={handleAnalyze}
        isLoading={isLoading}
        sampleTexts={sampleBills}
        showIncompleteOption={true}
      />

      {/* Loading State */}
      {isLoading && <LoadingState message="EXTRACTING BILL DETAILS..." />}

      {/* Fallback Error Warning Banner if incomplete AI extraction occurs */}
      {showWarning && (
        <ErrorBanner
          message="COULDN'T READ EVERYTHING — CHECK THE FIELDS BELOW AND FILL MISSING DATA"
          onDismiss={() => setShowWarning(false)}
        />
      )}

      {/* Result Card for Extracted Data */}
      {extractedData && !isLoading && (
        <ResultCard
          title="EXTRACTED REMINDER DETAILS"
          onSave={handleSaveExtracted}
          onDiscard={handleDiscardExtracted}
          saveText="ADD TO MY REMINDERS"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
                TITLE / BILL NAME
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="nb-input text-sm"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
                AMOUNT ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                className="nb-input text-sm"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
                DUE DATE
              </label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="nb-input text-sm"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-black uppercase mb-1 text-black">
                CATEGORY
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Reminder['category'])}
                className="nb-input text-sm font-bold bg-white"
              >
                <option value="Bills">Bills</option>
                <option value="Rent">Rent</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Insurance">Insurance</option>
                <option value="Tax">Tax</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </ResultCard>
      )}

      {/* Reminders List Section */}
      <div className="nb-card p-5 md:p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFE066] p-1.5 border-2 border-black">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="font-heading text-lg md:text-xl font-black uppercase text-black">
              SAVED REMINDERS ({reminders.length})
            </h2>
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-black stroke-[2.5]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="nb-input text-xs font-bold py-1.5 px-3 bg-white w-auto"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="BILLS">BILLS</option>
              <option value="RENT">RENT</option>
              <option value="SUBSCRIPTIONS">SUBSCRIPTIONS</option>
              <option value="INSURANCE">INSURANCE</option>
              <option value="TAX">TAX</option>
            </select>
          </div>
        </div>

        {sortedReminders.length === 0 ? (
          <EmptyState
            title="NO REMINDERS FOUND"
            message="You don't have any saved bill reminders matching this filter. Paste a bill above to generate one!"
            icon={<Bell className="w-8 h-8 stroke-[2.5]" />}
          />
        ) : (
          <div className="space-y-4">
            {sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-4 border-3 border-black shadow-[4px_4px_0_#111111] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  reminder.status === 'PAID' ? 'bg-gray-100 opacity-75' : 'bg-[#FFF9EC]'
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={reminder.status} />
                    <span className="font-heading text-xs font-black uppercase bg-white border-2 border-black px-2 py-0.5">
                      {reminder.category}
                    </span>
                  </div>

                  <h3 className={`font-heading text-base md:text-lg font-black text-black ${reminder.status === 'PAID' ? 'line-through' : ''}`}>
                    {reminder.title}
                  </h3>

                  {reminder.description && (
                    <p className="text-xs font-medium text-gray-700 mt-1 max-w-xl">
                      {reminder.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-bold text-gray-800 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      DUE: {reminder.dueDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-black/10 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="font-heading text-2xl font-black text-black">
                      ${reminder.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePaid(reminder)}
                      className={`nb-btn text-xs px-3 py-1.5 ${
                        reminder.status === 'PAID' ? 'nb-btn-secondary' : 'nb-btn-success'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      {reminder.status === 'PAID' ? 'MARK UNPAID' : 'MARK PAID'}
                    </button>

                    <button
                      onClick={() => onDeleteReminder(reminder.id)}
                      title="Delete reminder"
                      className="nb-btn nb-btn-coral p-2 text-xs"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
