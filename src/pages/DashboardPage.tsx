import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { Reminder, SavedDraft, NoticeItem } from '../types';
import {
  Bell,
  FileEdit,
  PieChart,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckSquare,
  DollarSign,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';

interface DashboardPageProps {
  reminders: Reminder[];
  savedDrafts: SavedDraft[];
  notices: NoticeItem[];
  totalSpend: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  reminders,
  savedDrafts,
  notices,
  totalSpend,
}) => {
  const navigate = useNavigate();

  // Filter upcoming bills/reminders
  const pendingReminders = reminders.filter((r) => r.status !== 'PAID');
  const upcomingBillsTotal = pendingReminders.reduce((sum, r) => sum + r.amount, 0);

  // Due Date Clustering Check (Differentiator Feature 7.1)
  const today = new Date();
  const nextSevenDays = new Date();
  nextSevenDays.setDate(today.getDate() + 7);

  const clusteredReminders = pendingReminders.filter((r) => {
    if (!r.dueDate) return false;
    const due = new Date(r.dueDate);
    return due >= today && due <= nextSevenDays;
  });

  const clusterTotalAmount = clusteredReminders.reduce((sum, r) => sum + r.amount, 0);

  // Take next 3 reminders sorted by due date
  const next3Reminders = [...reminders]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Action items count from notices
  const pendingNoticeActions = notices.reduce(
    (count, notice) => count + notice.actionPoints.filter((a) => !a.completed).length,
    0
  );

  const lastDraft = savedDrafts[0];
  const lastNotice = notices[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-[#FFE066] border-4 border-black p-5 md:p-6 shadow-[6px_6px_0_#111111] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-heading text-xs font-black uppercase bg-black text-[#FFE066] px-2 py-0.5 border border-black">
              LIVE OVERVIEW
            </span>
            <span className="font-heading text-xs font-extrabold uppercase text-black">
              LIFE-ADMIN COPILOT
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black">
            YOUR ADMIN COMMAND CENTER
          </h1>
          <p className="font-medium text-black/80 text-sm mt-1">
            4 active modules • All tasks and automated extractions updated
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/reminders')}
            className="nb-btn text-xs py-2 px-3 bg-white hover:bg-[#FFE066]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            ADD BILL REMINDER
          </button>
        </div>
      </div>

      {/* Due Date Clustering Alert (Differentiator Feature 7.1) */}
      {clusteredReminders.length >= 2 && (
        <div className="bg-[#FF6B6B] text-black border-4 border-black p-4 shadow-[6px_6px_0_#111111] flex items-start gap-3 animate-pulse">
          <div className="bg-black text-[#FF6B6B] p-2 border-2 border-black flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[3]" />
          </div>
          <div className="flex-1">
            <div className="font-heading text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block mb-1">
              DUE DATE CLUSTER ALERT
            </div>
            <h2 className="font-heading text-base font-black uppercase">
              {clusteredReminders.length} BILLS TOTALING ${clusterTotalAmount.toFixed(2)} ARE DUE WITHIN THE NEXT 7 DAYS!
            </h2>
            <p className="text-xs font-bold text-black/90 mt-0.5">
              High cash flow demand ahead. Plan your payments or mark cleared items as paid.
            </p>
          </div>
          <button
            onClick={() => navigate('/reminders')}
            className="nb-btn bg-white text-black text-xs px-3 py-1.5 self-center font-black"
          >
            VIEW BILLS →
          </button>
        </div>
      )}

      {/* Top Row: 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          label="UPCOMING BILLS"
          value={`$${upcomingBillsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          colorBg="yellow"
          subtitle={`${pendingReminders.length} PENDING UNPAID BILLS`}
          icon={<DollarSign className="w-5 h-5 text-black stroke-[3]" />}
        />

        <MetricCard
          label="THIS MONTH'S SPEND"
          value={`$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          colorBg="coral"
          subtitle="PARSED ACROSS 4 CATEGORIES"
          icon={<PieChart className="w-5 h-5 text-black stroke-[3]" />}
        />

        <MetricCard
          label="NOTICES NEEDING ACTION"
          value={pendingNoticeActions}
          colorBg="teal"
          subtitle={`${notices.length} SAVED OFFICIAL NOTICES`}
          icon={<FileCheck2 className="w-5 h-5 text-black stroke-[3]" />}
        />
      </div>

      {/* Quick Prompt Blocks (First-Time or Action Triggers) */}
      <div className="bg-white border-3 border-black p-5 shadow-[5px_5px_0_#111111]">
        <h2 className="font-heading text-sm font-black uppercase text-black mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF3B3B] stroke-[3]" />
          QUICK START CO-PILOT ACTIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/reminders"
            className="p-3 bg-[#FFE066] border-2 border-black shadow-[3px_3px_0_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-heading text-xs font-black uppercase text-black">
                PASTE A BILL
              </div>
              <div className="text-[11px] font-semibold text-black/80">
                Extract due date & amount
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </Link>

          <Link
            to="/letter-drafter"
            className="p-3 bg-[#FF6B6B] border-2 border-black shadow-[3px_3px_0_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-heading text-xs font-black uppercase text-black">
                DRAFT A LETTER
              </div>
              <div className="text-[11px] font-semibold text-black/80">
                Complaint, leave or request
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </Link>

          <Link
            to="/expenses"
            className="p-3 bg-[#4ECDC4] border-2 border-black shadow-[3px_3px_0_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-heading text-xs font-black uppercase text-black">
                PARSE EXPENSES
              </div>
              <div className="text-[11px] font-semibold text-black/80">
                Category breakdown & tips
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </Link>

          <Link
            to="/notices"
            className="p-3 bg-[#A8E6CF] border-2 border-black shadow-[3px_3px_0_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-heading text-xs font-black uppercase text-black">
                SIMPLIFY NOTICE
              </div>
              <div className="text-[11px] font-semibold text-black/80">
                Summary & action points
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </Link>
        </div>
      </div>

      {/* Main Content Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Next 3 Reminders */}
        <div className="nb-card p-5 bg-white">
          <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFE066] p-1.5 border-2 border-black">
                <Bell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-lg font-black uppercase text-black">
                NEXT UPCOMING REMINDERS
              </h2>
            </div>
            <Link
              to="/reminders"
              className="font-heading text-xs font-black uppercase underline hover:bg-[#FFE066] px-1"
            >
              VIEW ALL ({reminders.length})
            </Link>
          </div>

          <div className="space-y-3">
            {next3Reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-3 bg-[#FFF9EC] border-2 border-black shadow-[3px_3px_0_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={reminder.status} size="sm" />
                    <span className="text-[11px] font-heading font-extrabold uppercase bg-white border border-black px-1.5 py-0.5">
                      {reminder.category}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-black">
                    {reminder.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>DUE: {reminder.dueDate}</span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-black/10 pt-2 sm:pt-0">
                  <div className="font-heading text-lg font-black text-black">
                    ${reminder.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="nb-card p-5 bg-white">
          <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#4ECDC4] p-1.5 border-2 border-black">
                <FileEdit className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-lg font-black uppercase text-black">
                RECENT ACTIVITY & DRAFTS
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Last Letter Draft */}
            {lastDraft ? (
              <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0_#111111]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-[10px] font-black uppercase bg-[#FF6B6B] text-black px-1.5 py-0.5 border border-black">
                    LETTER DRAFT
                  </span>
                  <span className="text-xs font-bold text-gray-600">
                    {lastDraft.date}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-black mb-1">
                  {lastDraft.templateTitle}
                </h3>
                <p className="text-xs font-medium text-gray-700 line-clamp-2 italic bg-[#FFF9EC] p-2 border border-black mb-2">
                  "{lastDraft.generatedText.substring(0, 110)}..."
                </p>
                <Link
                  to="/letter-drafter"
                  className="font-heading text-xs font-black uppercase text-black underline hover:bg-[#FFE066] p-0.5"
                >
                  OPEN LETTER DRAFTER →
                </Link>
              </div>
            ) : null}

            {/* Last Notice Summary */}
            {lastNotice ? (
              <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0_#111111]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-[10px] font-black uppercase bg-[#A8E6CF] text-black px-1.5 py-0.5 border border-black">
                    SIMPLIFIED NOTICE
                  </span>
                  <span className="text-xs font-bold text-gray-600">
                    {lastNotice.date}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-black mb-1">
                  {lastNotice.title}
                </h3>
                <p className="text-xs font-medium text-gray-800 line-clamp-2 bg-[#FFF9EC] p-2 border border-black mb-2">
                  {lastNotice.summaryParagraph}
                </p>
                <Link
                  to="/notices"
                  className="font-heading text-xs font-black uppercase text-black underline hover:bg-[#FFE066] p-0.5"
                >
                  VIEW ACTION CHECKLIST →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
