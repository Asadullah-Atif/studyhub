'use client';

import { useState, useRef } from 'react';
import {
  Settings, Palette, Bell, Download, Upload, Trash2,
  Moon, Sun, Monitor, Type, Clock, Check
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { useTheme } from '../../lib/theme';
import { Card, Button, Select } from '../../components/ui';
import { ConfirmModal } from '../../components/Modal';
import { cn } from '../../lib/utils';
import { ThemeMode, FontSize, AccentColor, ACCENT_COLORS } from '../../lib/types';

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData, resetAllData } = useStore();
  const { setTheme, setAccentColor } = useTheme();
  const { showToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: ThemeMode) => {
    setTheme(theme);
    updateSettings({ theme });
  };

  const handleAccentChange = (color: AccentColor) => {
    setAccentColor(color);
    updateSettings({ accentColor: color });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    updateSettings({ fontSize });
  };

  const handleNotificationToggle = () => {
    updateSettings({ notifications: !settings.notifications });
    showToast('success', settings.notifications ? 'Notifications disabled' : 'Notifications enabled');
  };

  const handlePomodoroChange = (key: string, value: number) => {
    updateSettings({ [key]: value });
    showToast('success', 'Timer settings updated');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyhub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Data exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importData(content);
      if (success) {
        showToast('success', 'Data imported successfully');
      } else {
        showToast('error', 'Failed to import data. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    showToast('success', 'All data has been reset');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Customize your study experience
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customize the look and feel</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value as ThemeMode)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                    settings.theme === option.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  )}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Accent Color
            </label>
            <div className="flex gap-2">
              {(Object.entries(ACCENT_COLORS) as [AccentColor, string][]).map(([color, hex]) => (
                <button
                  key={color}
                  onClick={() => handleAccentChange(color)}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-transform hover:scale-110',
                    settings.accentColor === color && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Font Size
            </label>
            <div className="flex gap-2">
              {[
                { value: 'small', label: 'Small', size: 'text-sm' },
                { value: 'medium', label: 'Medium', size: 'text-base' },
                { value: 'large', label: 'Large', size: 'text-lg' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value as FontSize)}
                  className={cn(
                    'flex-1 p-3 rounded-lg border transition-all',
                    settings.fontSize === option.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <span className={option.size}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Pomodoro Timer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure timer durations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Focus Duration (min)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={settings.pomodoroWork}
              onChange={(e) => handlePomodoroChange('pomodoroWork', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Short Break (min)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.pomodoroShortBreak}
              onChange={(e) => handlePomodoroChange('pomodoroShortBreak', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Long Break (min)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={settings.pomodoroLongBreak}
              onChange={(e) => handlePomodoroChange('pomodoroLongBreak', parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage notification preferences</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">In-app Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Show toast notifications for actions</p>
          </div>
          <button
            onClick={handleNotificationToggle}
            className={cn(
              'w-12 h-6 rounded-full transition-colors relative',
              settings.notifications ? 'bg-[var(--accent)]' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                settings.notifications ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Data Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Export, import, or reset your data</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data as JSON</p>
            </div>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Import Data</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restore from a JSON backup</p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">Reset All Data</p>
              <p className="text-sm text-red-600 dark:text-red-500">Delete all app data permanently</p>
            </div>
            <Button variant="danger" onClick={() => setShowResetConfirm(true)}>
              <Trash2 className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">StudyHub</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Version 1.0.0 • Your personal study companion
          </p>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="Are you sure you want to delete all your data? This action cannot be undone."
        confirmText="Reset"
      />
    </div>
  );
}
