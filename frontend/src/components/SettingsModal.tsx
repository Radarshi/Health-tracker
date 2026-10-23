import React, { useState, useEffect } from 'react';
import { X, Settings, Download, Trash2, Bell, Shield, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenOnboarding,
}) => {
  const { user, logout } = useAuth();
  const [mealReminders, setMealReminders] = useState(true);
  const [hydrationReminders, setHydrationReminders] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotificationPreferences();
    }
  }, [isOpen]);

  const loadNotificationPreferences = async () => {
    try {
      const pref = await api.getNotificationPreferences();
      setMealReminders(pref.meal_reminders);
      setHydrationReminders(pref.hydration_reminders);
      setQuietStart(pref.quiet_hours_start);
      setQuietEnd(pref.quiet_hours_end);
    } catch (e) {
      console.warn('Preferences load error:', e);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await api.updateNotificationPreferences({
        meal_reminders: mealReminders,
        hydration_reminders: hydrationReminders,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd,
      });
      alert('Notification preferences updated!');
    } catch (e: any) {
      alert(`Update error: ${e.message}`);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutritrack_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export error: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? All your logged meals, measurements, and recipes will be permanently erased.'
      )
    ) {
      try {
        await api.deleteAccount();
        logout();
        onClose();
      } catch (e: any) {
        alert(`Deletion error: ${e.message}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Settings & Preferences</h3>
              <p className="text-xs text-slate-400">Manage account, notifications, and privacy</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User info */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Signed in as:</span>
              <strong className="text-white text-sm">{user?.email || 'Demo Member'}</strong>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold transition-colors"
            >
              Edit Body Goals
            </button>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-400" />
              Notification Reminders
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Meal logging reminders (Breakfast, Lunch, Dinner)</span>
                <input
                  type="checkbox"
                  checked={mealReminders}
                  onChange={(e) => setMealReminders(e.target.checked)}
                  className="rounded text-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Hydration water intake reminders</span>
                <input
                  type="checkbox"
                  checked={hydrationReminders}
                  onChange={(e) => setHydrationReminders(e.target.checked)}
                  className="rounded text-emerald-500 w-4 h-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Quiet Hours Start</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Quiet Hours End</label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleUpdatePreferences}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Save Notification Preferences
            </button>
          </div>

          {/* Privacy & Data Management */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              Privacy & Data Controls
            </h4>

            <div className="space-y-2">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                {isExporting ? 'Generating JSON...' : 'Export All Nutrition & Personal Data (JSON)'}
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-rose-400 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account & Erase All Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
