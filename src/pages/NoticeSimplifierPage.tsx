import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoticeItem, ActionPoint } from '../types';
import { summarizeNoticeFromText } from '../services/mockNoticeSummary';
import { PasteInputCard } from '../components/PasteInputCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  FileCheck2,
  CheckSquare,
  Square,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  Share2,
  Calendar,
  Bell,
} from 'lucide-react';

interface NoticeSimplifierPageProps {
  notices: NoticeItem[];
  onAddNotice: (notice: NoticeItem) => void;
  onUpdateNotice: (notice: NoticeItem) => void;
  onDeleteNotice: (id: string) => void;
}

export const NoticeSimplifierPage: React.FC<NoticeSimplifierPageProps> = ({
  notices,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newNoticeResult, setNewNoticeResult] = useState<NoticeItem | null>(null);

  // Expanded notice ID tracking
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  const sampleNotices = [
    {
      label: 'Municipal Property Tax Revision',
      text: 'NOTICE OF REVISED PROPERTY TAX ASSESSMENT (Q3 2026). Pursuant to Section 14-B of Municipal Code, property values have been adjusted. Payment received before August 25 qualifies for 5% incentive deduction. Failure to clear assessment by September 30 incurs a 2% monthly interest penalty.',
    },
    {
      label: 'Building Water Mains Maintenance',
      text: 'ATTENTION RESIDENTS: Scheduled plumbing overhaul will disrupt water supply in Towers A and B on Thursday, August 6th between 09:00 AM and 04:00 PM. Please store sufficient household water in advance.',
    },
  ];

  const handleAnalyzeNotice = async (text: string) => {
    setIsLoading(true);
    setNewNoticeResult(null);

    try {
      const result = await summarizeNoticeFromText(text);
      setNewNoticeResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotice = () => {
    if (!newNoticeResult) return;
    onAddNotice(newNoticeResult);
    setNewNoticeResult(null);
  };

  const handleToggleActionPoint = (noticeId: string, pointId: string) => {
    const targetNotice = notices.find((n) => n.id === noticeId);
    if (!targetNotice) return;

    const updatedPoints = targetNotice.actionPoints.map((ap) => {
      if (ap.id === pointId) {
        return { ...ap, completed: !ap.completed };
      }
      return ap;
    });

    onUpdateNotice({ ...targetNotice, actionPoints: updatedPoints });
  };

  const handleToggleNewActionPoint = (pointId: string) => {
    if (!newNoticeResult) return;
    const updatedPoints = newNoticeResult.actionPoints.map((ap) => {
      if (ap.id === pointId) {
        return { ...ap, completed: !ap.completed };
      }
      return ap;
    });
    setNewNoticeResult({ ...newNoticeResult, actionPoints: updatedPoints });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#A8E6CF] border-4 border-black p-5 md:p-6 shadow-[6px_6px_0_#111111]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-xs font-black uppercase bg-black text-[#A8E6CF] px-2 py-0.5">
            MODULE 4
          </span>
          <span className="font-heading text-xs font-bold uppercase text-black">
            NOTICE SIMPLIFIER
          </span>
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black">
          LEGAL & PUBLIC NOTICE SUMMARIZER
        </h1>
        <p className="font-medium text-black/90 text-sm mt-1">
          Paste complex legal notices, government circulars, or building guidelines. Get a 1-paragraph summary + square checklist of key action points.
        </p>
      </div>

      {/* Paste Input Card */}
      <PasteInputCard
        title="PASTE NOTICE OR PUBLIC CIRCULAR TEXT"
        placeholder="e.g. 'NOTICE OF REVISED PROPERTY TAX ASSESSMENT Q3...'"
        onSubmit={handleAnalyzeNotice}
        isLoading={isLoading}
        sampleTexts={sampleNotices}
        buttonText="SIMPLIFY & EXTRACT ACTION CHECKLIST"
      />

      {/* Loading state */}
      {isLoading && <LoadingState message="PARSING LEGAL JARGON & GENERATING SUMMARY..." />}

      {/* Result Card for Newly Simplified Notice */}
      {newNoticeResult && !isLoading && (
        <div className="nb-card p-5 md:p-6 bg-[#FFF9EC] border-3 border-black">
          <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
            <span className="font-heading text-xs font-black uppercase bg-[#2ECC71] text-white px-2 py-1 border border-black shadow-[2px_2px_0_#111111]">
              SIMPLIFIED SUMMARY RESULT
            </span>
            <button
              onClick={() => setNewNoticeResult(null)}
              className="text-xs font-heading font-bold uppercase underline"
            >
              DISCARD
            </button>
          </div>

          <h3 className="font-heading text-xl font-black uppercase text-black mb-1">
            {newNoticeResult.title}
          </h3>
          <div className="text-xs font-bold text-gray-700 mb-4">
            SOURCE: {newNoticeResult.source} • DATE: {newNoticeResult.date}
          </div>

          {/* Bold Summary Paragraph Card */}
          <div className="bg-white border-3 border-black p-4 mb-6 shadow-[4px_4px_0_#111111]">
            <div className="font-heading text-xs font-black uppercase text-[#FF3B3B] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              EXECUTIVE SUMMARY
            </div>
            <p className="font-medium text-sm text-black leading-relaxed">
              {newNoticeResult.summaryParagraph}
            </p>
          </div>

          {/* Action Checklist with Square Checkboxes */}
          <div className="bg-white border-3 border-black p-4 mb-6 shadow-[4px_4px_0_#111111]">
            <div className="font-heading text-xs font-black uppercase text-black mb-3">
              KEY ACTION POINTS CHECKLIST (CLICK TO COMPLETE):
            </div>

            <div className="space-y-2">
              {newNoticeResult.actionPoints.map((ap) => (
                <label
                  key={ap.id}
                  className="flex items-start gap-3 p-2 bg-[#FFF9EC] border-2 border-black cursor-pointer hover:bg-white select-none transition-all"
                >
                  <input
                    type="checkbox"
                    checked={ap.completed}
                    onChange={() => handleToggleNewActionPoint(ap.id)}
                    className="nb-checkbox mt-0.5"
                  />
                  <span className={`font-heading text-xs font-bold text-black ${ap.completed ? 'line-through text-gray-500' : ''}`}>
                    {ap.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleSaveNotice}
              className="nb-btn nb-btn-success text-xs py-2.5 px-6 font-extrabold"
            >
              SAVE TO MY NOTICES HISTORY
            </button>
          </div>
        </div>
      )}

      {/* SAVED NOTICES HISTORY */}
      <div className="nb-card p-5 md:p-6 bg-white">
        <div className="flex items-center gap-2 border-b-3 border-black pb-4 mb-6">
          <div className="bg-[#A8E6CF] p-1.5 border-2 border-black">
            <FileCheck2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="font-heading text-lg md:text-xl font-black uppercase text-black">
            SAVED NOTICES HISTORY ({notices.length})
          </h2>
        </div>

        {notices.length === 0 ? (
          <EmptyState
            title="NO SAVED NOTICES"
            message="Paste a notice above to extract a simplified summary and action checklist!"
            icon={<FileCheck2 className="w-8 h-8 stroke-[2.5]" />}
          />
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => {
              const isExpanded = expandedNoticeId === notice.id;
              const completedCount = notice.actionPoints.filter((ap) => ap.completed).length;
              const totalCount = notice.actionPoints.length;

              return (
                <div
                  key={notice.id}
                  className="bg-[#FFF9EC] border-3 border-black shadow-[4px_4px_0_#111111] p-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading text-[10px] font-black uppercase bg-[#FFE066] text-black px-1.5 py-0.5 border border-black">
                          {notice.source}
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          {notice.date}
                        </span>
                      </div>
                      <h3 className="font-heading text-base font-black text-black">
                        {notice.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-xs font-black uppercase bg-white border-2 border-black px-2 py-1">
                        {completedCount}/{totalCount} ACTIONS DONE
                      </span>

                      <button
                        onClick={() =>
                          navigate('/reminders', {
                            state: { prefillNoticeText: `${notice.title}: ${notice.summaryParagraph} ${notice.rawText || ''}` },
                          })
                        }
                        className="nb-btn bg-[#FFE066] text-xs px-2.5 py-1 flex items-center gap-1 font-black"
                        title="Convert notice into a reminder"
                      >
                        <Bell className="w-3.5 h-3.5 stroke-[2.5]" />
                        CREATE REMINDER
                      </button>

                      <button
                        onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                        className="nb-btn nb-btn-secondary text-xs px-2.5 py-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
                        {isExpanded ? 'COLLAPSE' : 'EXPAND DETAILS'}
                      </button>

                      <button
                        onClick={() => onDeleteNotice(notice.id)}
                        className="nb-btn nb-btn-coral p-1.5 text-xs"
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Short Summary Preview */}
                  <p className="text-xs font-medium text-gray-800 mt-3 line-clamp-2 bg-white p-2 border-2 border-black">
                    {notice.summaryParagraph}
                  </p>

                  {/* Expanded Checklist View */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-black bg-white p-4 border-2 shadow-[3px_3px_0_#111111]">
                      <h4 className="font-heading text-xs font-black uppercase text-black mb-3">
                        ACTION CHECKLIST:
                      </h4>

                      <div className="space-y-2 mb-4">
                        {notice.actionPoints.map((ap) => (
                          <label
                            key={ap.id}
                            className="flex items-center gap-3 p-2 bg-[#FFF9EC] border-2 border-black cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={ap.completed}
                              onChange={() => handleToggleActionPoint(notice.id, ap.id)}
                              className="nb-checkbox"
                            />
                            <span className={`font-heading text-xs font-bold ${ap.completed ? 'line-through text-gray-500' : 'text-black'}`}>
                              {ap.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      {notice.rawText && (
                        <div>
                          <span className="font-heading text-[10px] font-black uppercase text-gray-600 block mb-1">
                            ORIGINAL PASTE TEXT:
                          </span>
                          <p className="font-mono text-xs text-gray-700 bg-gray-100 p-2 border border-black max-h-32 overflow-y-auto">
                            {notice.rawText}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
