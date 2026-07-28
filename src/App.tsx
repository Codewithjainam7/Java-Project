import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { TopNavbar } from './components/TopNavbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RemindersPage } from './pages/RemindersPage';
import { LetterDrafterPage } from './pages/LetterDrafterPage';
import { ExpenseOrganizerPage } from './pages/ExpenseOrganizerPage';
import { NoticeSimplifierPage } from './pages/NoticeSimplifierPage';
import { SettingsPage } from './pages/SettingsPage';
import { AndroidCompanionWidget } from './components/AndroidCompanionWidget';

import {
  INITIAL_REMINDERS,
  INITIAL_SAVED_DRAFTS,
  INITIAL_EXPENSES,
  INITIAL_NOTICES,
  DEFAULT_USER_SETTINGS,
} from './data/initialMockData';

import { Reminder, SavedDraft, ExpenseItem, NoticeItem, UserSettings } from './types';

export default function App() {
  // Load state from localStorage or initial mock data
  const [user, setUser] = useState<{ displayName: string; email: string } | null>(() => {
    const saved = localStorage.getItem('copilot_user');
    return saved ? JSON.parse(saved) : { displayName: 'Jane Doe', email: 'jane.doe@example.com' };
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('copilot_settings');
    return saved ? JSON.parse(saved) : DEFAULT_USER_SETTINGS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('copilot_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    const saved = localStorage.getItem('copilot_drafts');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_DRAFTS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('copilot_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    const saved = localStorage.getItem('copilot_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('copilot_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('copilot_drafts', JSON.stringify(savedDrafts));
  }, [savedDrafts]);

  useEffect(() => {
    localStorage.setItem('copilot_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('copilot_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('copilot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('copilot_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('copilot_settings', JSON.stringify(settings));
  }, [settings]);

  // Handler functions for state updates
  const handleLogin = (displayName: string, email: string) => {
    const newUser = { displayName, email };
    setUser(newUser);
    setSettings((prev) => ({ ...prev, displayName, email }));
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddReminder = (newReminder: Reminder) => {
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleUpdateReminder = (updated: Reminder) => {
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveDraft = (draft: SavedDraft) => {
    setSavedDrafts((prev) => [draft, ...prev]);
  };

  const handleDeleteDraft = (id: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddExpense = (item: ExpenseItem) => {
    setExpenses((prev) => [item, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSetAllExpenses = (items: ExpenseItem[]) => {
    setExpenses(items);
  };

  const handleAddNotice = (notice: NoticeItem) => {
    setNotices((prev) => [notice, ...prev]);
  };

  const handleUpdateNotice = (updatedNotice: NoticeItem) => {
    setNotices((prev) => prev.map((n) => (n.id === updatedNotice.id ? updatedNotice : n)));
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // Calculate total spend for dashboard metric
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FFF9EC] text-[#111111] flex flex-col font-sans selection:bg-[#FFE066] selection:text-black">
        {user && (
          <TopNavbar
            userDisplayName={user.displayName}
            onLogout={handleLogout}
          />
        )}

        <main className="flex-1 w-full max-w-[960px] mx-auto px-4 py-6 md:py-8">
          <Routes>
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />

            <Route
              path="/dashboard"
              element={
                user ? (
                  <DashboardPage
                    reminders={reminders}
                    savedDrafts={savedDrafts}
                    notices={notices}
                    totalSpend={totalSpend}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/reminders"
              element={
                user ? (
                  <RemindersPage
                    reminders={reminders}
                    onAddReminder={handleAddReminder}
                    onUpdateReminder={handleUpdateReminder}
                    onDeleteReminder={handleDeleteReminder}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/letter-drafter"
              element={
                user ? (
                  <LetterDrafterPage
                    savedDrafts={savedDrafts}
                    onSaveDraft={handleSaveDraft}
                    onDeleteDraft={handleDeleteDraft}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/expenses"
              element={
                user ? (
                  <ExpenseOrganizerPage
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onDeleteExpense={handleDeleteExpense}
                    onSetAllExpenses={handleSetAllExpenses}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/notices"
              element={
                user ? (
                  <NoticeSimplifierPage
                    notices={notices}
                    onAddNotice={handleAddNotice}
                    onUpdateNotice={handleUpdateNotice}
                    onDeleteNotice={handleDeleteNotice}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/settings"
              element={
                user ? (
                  <SettingsPage
                    settings={settings}
                    onSaveSettings={(newSettings) => {
                      setSettings(newSettings);
                      setUser({
                        displayName: newSettings.displayName,
                        email: newSettings.email,
                      });
                    }}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {user && (
          <AndroidCompanionWidget
            onAddReminder={handleAddReminder}
            onAddExpense={handleAddExpense}
            onAddNotice={handleAddNotice}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </BrowserRouter>
  );
}
