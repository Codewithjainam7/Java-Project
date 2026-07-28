import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Send,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  X,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Reminder, ExpenseItem, NoticeItem } from '../types';
import { extractReminderFromText } from '../services/mockReminderExtraction';
import { parseExpensesFromText } from '../services/mockExpenseParser';
import { summarizeNoticeFromText } from '../services/mockNoticeSummary';
import { generateLetterDraft } from '../services/mockLetterDraft';

interface AndroidCompanionWidgetProps {
  onAddReminder: (reminder: Reminder) => void;
  onAddExpense: (expense: ExpenseItem) => void;
  onAddNotice: (notice: NoticeItem) => void;
  onSaveDraft?: (draft: any) => void;
}

interface CapturedQueueItem {
  id: string;
  source: 'SMS' | 'WhatsApp' | 'Voice';
  rawText: string;
  module: 'reminder' | 'expense' | 'notice' | 'draft';
  status: 'NEEDS_REVIEW' | 'READY_TO_SAVE' | 'SAVED';
  extractedData: any;
  timestamp: string;
}

export const AndroidCompanionWidget: React.FC<AndroidCompanionWidgetProps> = ({
  onAddReminder,
  onAddExpense,
  onAddNotice,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'queue' | 'settings'>('voice');

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [routedModule, setRoutedModule] = useState<string | null>(null);
  const [voiceResult, setVoiceResult] = useState<any | null>(null);
  const [speechOutput, setSpeechOutput] = useState<string | null>(null);

  // Auto-Capture Queue State
  const [foregroundServiceActive, setForegroundServiceActive] = useState(true);
  const [capturedQueue, setCapturedQueue] = useState<CapturedQueueItem[]>([
    {
      id: 'cap-1',
      source: 'SMS',
      rawText: 'ALERT: Your City Water Utility bill of $64.50 is due on 2026-08-05. Ref# W-99812',
      module: 'reminder',
      status: 'READY_TO_SAVE',
      extractedData: {
        title: 'City Water Utility Bill',
        amount: 64.5,
        dueDate: '2026-08-05',
        category: 'Bills',
        description: 'Auto-captured from SMS Ref# W-99812',
      },
      timestamp: '10 mins ago',
    },
    {
      id: 'cap-2',
      source: 'WhatsApp',
      rawText: 'Forwarded: Notice from Society Mgmt: Water supply will be shut for annual tank cleaning this Saturday 9 AM to 3 PM.',
      module: 'notice',
      status: 'NEEDS_REVIEW',
      extractedData: {
        title: 'Annual Water Tank Cleaning Advisory',
        source: 'Society Management',
        summaryParagraph: 'KEY SUMMARY: Water supply will be shut down this Saturday from 9 AM to 3 PM for annual tank maintenance.',
        actionPoints: [
          { id: 'ap-1', text: 'Store sufficient water for domestic use', completed: false },
          { id: 'ap-2', text: 'Keep main valves turned off during maintenance window', completed: false },
        ],
      },
      timestamp: '25 mins ago',
    },
  ]);

  // Text-To-Speech helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Browser Speech Recognition handler
  const startSpeechRecognition = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('BROWSER SPEECH RECOGNITION API NOT SUPPORTED — USE THE COMMAND PROMPT BELOW!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError(
            'MICROPHONE RESTRICTED IN PREVIEW IFRAME — TYPE YOUR COMMAND OR CLICK A QUICK PRESET BELOW!'
          );
          if (!transcript) {
            setTranscript('Remind me electricity bill of $145 is due on August 10th');
          }
        } else {
          setSpeechError(`SPEECH INPUT (${event.error.toUpperCase()}) — TYPE COMMAND BELOW.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setSpeechError('COULD NOT START MICROPHONE — TYPE YOUR COMMAND BELOW.');
    }
  };

  // Handle Assistant Command Process
  const handleProcessVoiceCommand = async (commandText: string) => {
    if (!commandText.trim()) return;
    setIsProcessing(true);
    setVoiceResult(null);
    setSpeechOutput(null);

    try {
      // Step 1: Route command via /api/assistant/route
      const routeRes = await fetch('/api/assistant/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commandText }),
      });

      const routeData = await routeRes.json();
      const targetModule = routeData.module || 'reminder';
      setRoutedModule(targetModule);

      // Step 2: Call target module parser
      let resultObj: any = null;
      let spokenMsg = '';

      if (targetModule === 'reminder') {
        resultObj = await extractReminderFromText(commandText);
        spokenMsg = `I've set up a reminder for ${resultObj.title} due on ${resultObj.dueDate || 'specified date'}.`;
      } else if (targetModule === 'expense') {
        const report = await parseExpensesFromText(commandText);
        resultObj = report.items[0] || {
          title: 'Parsed Expense',
          amount: 25.0,
          category: 'Shopping/Other',
          date: new Date().toISOString().split('T')[0],
        };
        spokenMsg = `I've logged an expense of $${resultObj.amount} for ${resultObj.title}.`;
      } else if (targetModule === 'notice') {
        resultObj = await summarizeNoticeFromText(commandText);
        spokenMsg = `I've summarized the notice: ${resultObj.title}.`;
      } else if (targetModule === 'draft') {
        const content = await generateLetterDraft('tpl-1', { issueType: commandText });
        resultObj = { content };
        spokenMsg = `I've generated your letter draft. Review it and tap save when ready.`;
      }

      setVoiceResult(resultObj);
      setSpeechOutput(spokenMsg);
      speakText(spokenMsg);
    } catch (err) {
      console.error('Failed voice assistant process:', err);
      setSpeechOutput("Sorry, I couldn't process that command.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Voice Result to State
  const handleSaveVoiceResult = () => {
    if (!voiceResult || !routedModule) return;

    if (routedModule === 'reminder') {
      const newRem: Reminder = {
        id: `rem-voice-${Date.now()}`,
        title: voiceResult.title || 'Voice Reminder',
        amount: voiceResult.amount || 0,
        dueDate: voiceResult.dueDate || new Date().toISOString().split('T')[0],
        category: voiceResult.category || 'Bills',
        status: 'PENDING',
        description: voiceResult.description || 'Captured via Tap-to-Speak Voice',
        createdDate: new Date().toISOString().split('T')[0],
      };
      onAddReminder(newRem);
      navigate('/reminders');
    } else if (routedModule === 'expense') {
      const newExp: ExpenseItem = {
        id: `exp-voice-${Date.now()}`,
        title: voiceResult.title || 'Voice Expense',
        amount: voiceResult.amount || 0,
        category: voiceResult.category || 'Shopping/Other',
        date: voiceResult.date || new Date().toISOString().split('T')[0],
      };
      onAddExpense(newExp);
      navigate('/expenses');
    } else if (routedModule === 'notice') {
      onAddNotice(voiceResult);
      navigate('/notices');
    }

    setVoiceResult(null);
    setTranscript('');
    setIsOpen(false);
  };

  // Simulate Incoming SMS/WhatsApp Capture
  const handleSimulateCapture = async (type: 'SMS_BILL' | 'WHATSAPP_NOTICE' | 'SMS_EXPENSE') => {
    let rawText = '';
    let source: 'SMS' | 'WhatsApp' = 'SMS';

    if (type === 'SMS_BILL') {
      source = 'SMS';
      rawText = `REMINDER: Your Metro Gas Company bill of $78.20 is due on 2026-08-12. Pay online at metro.gas/pay`;
    } else if (type === 'WHATSAPP_NOTICE') {
      source = 'WhatsApp';
      rawText = `IMPORTANT: Municipal Tax Department notification regarding updated property tax assessments for FY2026-27. All property owners must verify details before August 31.`;
    } else if (type === 'SMS_EXPENSE') {
      source = 'SMS';
      rawText = `Card Alert: You spent $42.80 at Organic Whole Foods Store on 2026-07-28. Available limit updated.`;
    }

    let module: 'reminder' | 'expense' | 'notice' = 'reminder';
    let extractedData: any = null;

    if (type === 'SMS_BILL') {
      module = 'reminder';
      extractedData = await extractReminderFromText(rawText);
    } else if (type === 'WHATSAPP_NOTICE') {
      module = 'notice';
      extractedData = await summarizeNoticeFromText(rawText);
    } else {
      module = 'expense';
      const rep = await parseExpensesFromText(rawText);
      extractedData = rep.items[0];
    }

    const newItem: CapturedQueueItem = {
      id: `cap-${Date.now()}`,
      source,
      rawText,
      module,
      status: 'READY_TO_SAVE',
      extractedData,
      timestamp: 'Just now',
    };

    setCapturedQueue((prev) => [newItem, ...prev]);
    setActiveTab('queue');
  };

  // Approve queue item
  const handleApproveQueueItem = (item: CapturedQueueItem) => {
    if (item.module === 'reminder') {
      onAddReminder({
        id: `rem-auto-${Date.now()}`,
        title: item.extractedData.title || 'Auto Reminder',
        amount: item.extractedData.amount || 0,
        dueDate: item.extractedData.dueDate || new Date().toISOString().split('T')[0],
        category: item.extractedData.category || 'Bills',
        status: 'PENDING',
        description: `Auto-captured via ${item.source}`,
        createdDate: new Date().toISOString().split('T')[0],
      });
    } else if (item.module === 'notice') {
      onAddNotice(item.extractedData);
    } else if (item.module === 'expense') {
      onAddExpense({
        id: `exp-auto-${Date.now()}`,
        title: item.extractedData.title || 'Auto Expense',
        amount: item.extractedData.amount || 0,
        category: item.extractedData.category || 'Shopping/Other',
        date: item.extractedData.date || new Date().toISOString().split('T')[0],
      });
    }

    setCapturedQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'SAVED' } : q))
    );
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#FFE066] text-black border-4 border-black p-3.5 rounded-full shadow-[6px_6px_0_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2 font-heading font-black text-xs uppercase"
        title="Open Android Companion Assistant Layer"
      >
        <Smartphone className="w-5 h-5 stroke-[2.5]" />
        <span className="hidden sm:inline">ANDROID COPILOT</span>
        {capturedQueue.filter((q) => q.status !== 'SAVED').length > 0 && (
          <span className="bg-[#FF6B6B] text-white px-1.5 py-0.5 rounded-full text-[10px] font-black border border-black">
            {capturedQueue.filter((q) => q.status !== 'SAVED').length}
          </span>
        )}
      </button>

      {/* Modal Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFF9EC] border-4 border-black shadow-[10px_10px_0_#111111] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="bg-[#111111] text-white p-4 border-b-4 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#FFE066]" />
                <h2 className="font-heading text-sm font-black uppercase tracking-wider text-white">
                  ANDROID AUTOMATED ASSISTANT LAYER
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-[#FFE066] p-1 border-2 border-transparent hover:border-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header Navigation Tabs */}
            <div className="flex border-b-4 border-black bg-white">
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-2.5 px-2 text-xs font-heading font-black uppercase border-r-2 border-black flex items-center justify-center gap-1.5 ${
                  activeTab === 'voice' ? 'bg-[#FFE066] text-black' : 'bg-white text-gray-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                TAP-TO-SPEAK
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`flex-1 py-2.5 px-2 text-xs font-heading font-black uppercase border-r-2 border-black flex items-center justify-center gap-1.5 ${
                  activeTab === 'queue' ? 'bg-[#FFE066] text-black' : 'bg-white text-gray-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                AUTO-CAPTURE ({capturedQueue.filter((q) => q.status !== 'SAVED').length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2.5 px-2 text-xs font-heading font-black uppercase flex items-center justify-center gap-1.5 ${
                  activeTab === 'settings' ? 'bg-[#FFE066] text-black' : 'bg-white text-gray-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                SERVICE
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: TAP TO SPEAK VOICE ASSISTANT */}
              {activeTab === 'voice' && (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-black p-4 text-center space-y-3 shadow-[4px_4px_0_#111111]">
                    <p className="text-xs font-bold text-gray-700 uppercase">
                      SPEAK OR TYPE A NATURAL LIFE-ADMIN COMMAND
                    </p>

                    {speechError && (
                      <div className="bg-[#FFE066] border-2 border-black p-2.5 text-left text-xs font-bold text-black flex items-start gap-2 shadow-[2px_2px_0_#111111]">
                        <AlertCircle className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-heading font-black text-[11px] uppercase">{speechError}</p>
                          <p className="text-[10px] font-semibold text-gray-800 mt-1">
                            Tip: You can type your command directly into the input box below or select one of the quick preset buttons.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mic Pulse Button */}
                    <button
                      onClick={startSpeechRecognition}
                      className={`w-16 h-16 rounded-full border-4 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0_#111111] transition-all ${
                        isListening
                          ? 'bg-[#FF6B6B] text-white animate-bounce'
                          : 'bg-[#FFE066] text-black hover:scale-105'
                      }`}
                      title="Click to speak command"
                    >
                      {isListening ? (
                        <MicOff className="w-8 h-8 stroke-[3]" />
                      ) : (
                        <Mic className="w-8 h-8 stroke-[3]" />
                      )}
                    </button>

                    <p className="text-[11px] font-bold text-gray-500">
                      {isListening ? 'LISTENING... SPEAK NOW' : 'TAP MIC TO START SPEAKING'}
                    </p>
                  </div>

                  {/* Manual / Transcribed Command Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-heading font-black uppercase block">
                      VOICE TRANSCRIPTION / COMMAND PROMPT
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="e.g. 'Remind me the $120 power bill is due next Monday' or 'Spent $35 on groceries'"
                        className="nb-input flex-1 text-xs"
                      />
                      <button
                        onClick={() => handleProcessVoiceCommand(transcript)}
                        disabled={isProcessing || !transcript.trim()}
                        className="nb-btn bg-[#111111] text-white text-xs px-3 py-2 flex items-center gap-1 font-black"
                      >
                        {isProcessing ? (
                          <Sparkles className="w-4 h-4 animate-spin text-[#FFE066]" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Voice Prompts */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-500">OR TRY QUICK PRESETS:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          const t = 'Remind me electricity bill of $145 is due on August 10th';
                          setTranscript(t);
                          handleProcessVoiceCommand(t);
                        }}
                        className="text-[11px] font-bold bg-white border border-black px-2 py-1 hover:bg-[#FFE066]"
                      >
                        ⚡ Power bill $145 due Aug 10
                      </button>
                      <button
                        onClick={() => {
                          const t = 'Spent $55 on Organic Market groceries today';
                          setTranscript(t);
                          handleProcessVoiceCommand(t);
                        }}
                        className="text-[11px] font-bold bg-white border border-black px-2 py-1 hover:bg-[#FFE066]"
                      >
                        🛒 Spent $55 on groceries
                      </button>
                      <button
                        onClick={() => {
                          const t = 'Draft a formal complaint letter to landlord about roof leak';
                          setTranscript(t);
                          handleProcessVoiceCommand(t);
                        }}
                        className="text-[11px] font-bold bg-white border border-black px-2 py-1 hover:bg-[#FFE066]"
                      >
                        ✍️ Complaint letter roof leak
                      </button>
                    </div>
                  </div>

                  {/* Assistant AI Result Card */}
                  {voiceResult && (
                    <div className="bg-[#4ECDC4]/10 border-2 border-black p-3 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-[10px] font-black uppercase bg-[#4ECDC4] text-black px-2 py-0.5 border border-black">
                          ROUTED TO: {routedModule?.toUpperCase()}
                        </span>
                        {speechOutput && (
                          <button
                            onClick={() => speakText(speechOutput)}
                            className="text-xs font-bold flex items-center gap-1 text-black hover:underline"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> SPEAK AGAIN
                          </button>
                        )}
                      </div>

                      <div className="bg-white border border-black p-2 text-xs space-y-1 font-mono">
                        {voiceResult.title && <p><strong>TITLE:</strong> {voiceResult.title}</p>}
                        {voiceResult.amount !== undefined && <p><strong>AMOUNT:</strong> ${voiceResult.amount}</p>}
                        {voiceResult.dueDate && <p><strong>DUE DATE:</strong> {voiceResult.dueDate}</p>}
                        {voiceResult.summaryParagraph && <p><strong>SUMMARY:</strong> {voiceResult.summaryParagraph}</p>}
                        {voiceResult.content && <p className="whitespace-pre-wrap max-h-24 overflow-y-auto">{voiceResult.content}</p>}
                      </div>

                      <button
                        onClick={handleSaveVoiceResult}
                        className="nb-btn bg-[#FFE066] text-black w-full text-xs py-2 font-black flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" /> SAVE TO {routedModule?.toUpperCase()}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AUTOMATED SMS & NOTIFICATION QUEUE */}
              {activeTab === 'queue' && (
                <div className="space-y-4">
                  {/* Simulation Trigger Bar */}
                  <div className="bg-white border-2 border-black p-3 space-y-2">
                    <p className="text-xs font-heading font-black uppercase">
                      SIMULATE INCOMING CAPTURE (SMS / WHATSAPP):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSimulateCapture('SMS_BILL')}
                        className="nb-btn bg-[#FFE066] text-[10px] py-1.5 font-bold"
                      >
                        + SIMULATE BILL SMS
                      </button>
                      <button
                        onClick={() => handleSimulateCapture('WHATSAPP_NOTICE')}
                        className="nb-btn bg-[#A8E6CF] text-[10px] py-1.5 font-bold"
                      >
                        + WHATSAPP NOTICE
                      </button>
                      <button
                        onClick={() => handleSimulateCapture('SMS_EXPENSE')}
                        className="nb-btn bg-[#4ECDC4] text-[10px] py-1.5 font-bold"
                      >
                        + CARD RECEIPT
                      </button>
                    </div>
                  </div>

                  {/* Captured Items List */}
                  <div className="space-y-3">
                    {capturedQueue.map((item) => (
                      <div
                        key={item.id}
                        className={`border-2 border-black p-3 space-y-2 shadow-[3px_3px_0_#111111] ${
                          item.status === 'SAVED' ? 'bg-gray-100 opacity-60' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5">
                              {item.source}
                            </span>
                            <span className="font-heading text-[10px] font-black uppercase bg-[#FFE066] text-black px-1.5 py-0.5 border border-black">
                              MODULE: {item.module}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500">{item.timestamp}</span>
                        </div>

                        <p className="text-xs text-gray-800 bg-gray-50 p-1.5 border border-dashed border-gray-400 italic">
                          "{item.rawText}"
                        </p>

                        {item.extractedData && (
                          <div className="bg-[#FFF9EC] p-2 border border-black text-xs space-y-0.5">
                            <p className="font-bold">{item.extractedData.title}</p>
                            {item.extractedData.amount && <p>Amount: ${item.extractedData.amount}</p>}
                            {item.extractedData.dueDate && <p>Due: {item.extractedData.dueDate}</p>}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                              item.status === 'SAVED'
                                ? 'bg-green-200 text-green-900'
                                : 'bg-[#FFE066] text-black'
                            }`}
                          >
                            {item.status}
                          </span>

                          {item.status !== 'SAVED' && (
                            <button
                              onClick={() => handleApproveQueueItem(item)}
                              className="nb-btn bg-[#111111] text-white text-xs px-3 py-1 font-bold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE066]" /> APPROVE & SAVE
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICE SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-black p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-xs font-black uppercase">
                          PERSISTENT FOREGROUND SERVICE
                        </h4>
                        <p className="text-[11px] text-gray-600">
                          Keeps SMS & Notification Auto-Capture active in background
                        </p>
                      </div>
                      <button
                        onClick={() => setForegroundServiceActive(!foregroundServiceActive)}
                        className={`px-3 py-1 text-xs font-black border-2 border-black ${
                          foregroundServiceActive ? 'bg-[#A8E6CF] text-black' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {foregroundServiceActive ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>

                    <div className="border-t border-black pt-2 space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-500">MONITORED APP PACKAGES:</p>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold bg-gray-100 border border-black px-2 py-0.5">
                          com.whatsapp
                        </span>
                        <span className="text-[10px] font-bold bg-gray-100 border border-black px-2 py-0.5">
                          com.google.android.apps.messaging
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FFE066]/20 border-2 border-black p-3 space-y-1">
                    <div className="flex items-center gap-1 text-xs font-black">
                      <ShieldAlert className="w-4 h-4 text-black" />
                      PRIVACY GUARANTEE
                    </div>
                    <p className="text-[11px] text-gray-800">
                      Local regex filters process messages on-device first. Only financial or administrative notice snippets pass to the AI backend.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
