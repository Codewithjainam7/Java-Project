import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Settings, Save, CheckCircle2, User, Mail, Globe, Bell } from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [language, setLanguage] = useState<UserSettings['language']>(settings.language);
  const [notificationChannel, setNotificationChannel] = useState<UserSettings['notificationChannel']>(
    settings.notificationChannel
  );

  const [showSavedBadge, setShowSavedBadge] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      displayName,
      language,
      notificationChannel,
    });

    setShowSavedBadge(true);
    setTimeout(() => {
      setShowSavedBadge(false);
    }, 2500);
  };

  return (
    <div className="max-w-[700px] mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#FFE066] border-4 border-black p-5 md:p-6 shadow-[6px_6px_0_#111111]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-xs font-black uppercase bg-black text-[#FFE066] px-2 py-0.5">
            PREFERENCES
          </span>
          <span className="font-heading text-xs font-bold uppercase text-black">
            USER CONFIGURATION
          </span>
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-black uppercase text-black">
          ACCOUNT & APP SETTINGS
        </h1>
        <p className="font-medium text-black/80 text-sm mt-1">
          Update profile display details, notification preferences, and system language.
        </p>
      </div>

      {/* Form Card */}
      <div className="nb-card p-6 bg-white relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-heading text-xs font-black uppercase mb-1 text-black flex items-center gap-1.5">
              <User className="w-4 h-4 stroke-[2.5]" />
              DISPLAY NAME
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="nb-input text-sm"
            />
          </div>

          <div>
            <label className="block font-heading text-xs font-black uppercase mb-1 text-black flex items-center gap-1.5">
              <Mail className="w-4 h-4 stroke-[2.5]" />
              EMAIL ADDRESS (READ-ONLY)
            </label>
            <input
              type="email"
              readOnly
              value={settings.email}
              className="nb-input text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-heading text-xs font-black uppercase mb-1 text-black flex items-center gap-1.5">
              <Globe className="w-4 h-4 stroke-[2.5]" />
              LANGUAGE PREFERENCE
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as UserSettings['language'])}
              className="nb-input text-sm font-bold bg-white"
            >
              <option value="English">ENGLISH</option>
              <option value="Hindi">HINDI (हिंदी)</option>
              <option value="Marathi">MARATHI (मराठी)</option>
            </select>
          </div>

          <div>
            <label className="block font-heading text-xs font-black uppercase mb-1 text-black flex items-center gap-1.5">
              <Bell className="w-4 h-4 stroke-[2.5]" />
              NOTIFICATION CHANNEL
            </label>
            <select
              value={notificationChannel}
              onChange={(e) =>
                setNotificationChannel(e.target.value as UserSettings['notificationChannel'])
              }
              className="nb-input text-sm font-bold bg-white"
            >
              <option value="Email">EMAIL NOTIFICATIONS</option>
              <option value="SMS">SMS NOTIFICATIONS</option>
              <option value="Both">BOTH EMAIL & SMS</option>
            </select>
          </div>

          <div className="pt-4 border-t-3 border-black flex items-center justify-between">
            {showSavedBadge ? (
              <div className="bg-[#2ECC71] text-white font-heading text-xs font-black uppercase px-4 py-2 border-2 border-black shadow-[3px_3px_0_#111111] flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                SAVED PREFERENCES!
              </div>
            ) : (
              <div className="text-xs font-semibold text-gray-500">
                Changes saved locally
              </div>
            )}

            <button type="submit" className="nb-btn text-sm py-3 px-6">
              <Save className="w-5 h-5 stroke-[2.5]" />
              SAVE SETTINGS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
