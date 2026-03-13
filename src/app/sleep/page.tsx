'use client';

import { useState, useMemo } from 'react';
import {
  Moon, Plus, Trash2, Edit2, Sun, Battery, TrendingUp, AlertCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, EmptyState } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn, formatDate, getHeatmapColor } from '../../lib/utils';
import { SleepLog } from '../../lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function SleepPage() {
  const { sleepLogs, addSleepLog, updateSleepLog } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 7,
    energy: 3,
  });

  const handleSubmit = () => {
    if (formData.hours < 0 || formData.hours > 24) {
      showToast('error', 'Please enter valid hours');
      return;
    }

    const logData: SleepLog = {
      id: editingLog?.id || generateId(),
      date: formData.date,
      hours: formData.hours,
      energy: formData.energy,
      createdAt: editingLog?.createdAt || new Date().toISOString(),
    };

    if (editingLog) {
      updateSleepLog(editingLog.id, logData);
      showToast('success', 'Sleep log updated');
    } else {
      addSleepLog(logData);
      showToast('success', 'Sleep logged');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingLog(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hours: 7,
      energy: 3,
    });
  };

  const handleEdit = (log: SleepLog) => {
    setEditingLog(log);
    setFormData({
      date: log.date,
      hours: log.hours,
      energy: log.energy,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(null);
    showToast('success', 'Log deleted');
  };

  const recentLogs = sleepLogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const avgSleep = useMemo(() => {
    if (sleepLogs.length === 0) return 0;
    return sleepLogs.reduce((sum, l) => sum + l.hours, 0) / sleepLogs.length;
  }, [sleepLogs]);

  const avgEnergy = useMemo(() => {
    if (sleepLogs.length === 0) return 0;
    return sleepLogs.reduce((sum, l) => sum + l.energy, 0) / sleepLogs.length;
  }, [sleepLogs]);

  const chartData = sleepLogs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)
    .map(log => ({
      date: formatDate(log.date, 'MM/dd'),
      hours: log.hours,
      energy: log.energy * 2,
    }));

  const getRecommendation = () => {
    if (avgSleep < 6) {
      return {
        type: 'warning',
        message: 'You\'re not getting enough sleep. Aim for 7-9 hours for optimal study performance.',
      };
    }
    if (avgEnergy < 2.5) {
      return {
        type: 'info',
        message: 'Your energy levels are low. Consider taking more breaks and improving sleep quality.',
      };
    }
    return {
      type: 'success',
      message: 'Great job! Your sleep patterns are healthy. Keep it up!',
    };
  };

  const correlationData = sleepLogs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)
    .map(log => ({
      sleep: log.hours,
      energy: log.energy,
    }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sleep & Energy Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor your sleep patterns and energy levels
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Log Sleep
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Sleep</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgSleep.toFixed(1)}h
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
              <Battery className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Energy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgEnergy.toFixed(1)}/5
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sleepLogs.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Sun className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sleepLogs.find(l => l.date === new Date().toISOString().split('T')[0])?.hours || '-'}h
              </p>
            </div>
          </div>
        </Card>
      </div>

      {sleepLogs.length > 0 && (
        <>
          {(() => {
            const rec = getRecommendation();
            return (
              <div className={cn(
                'p-4 rounded-lg border',
                rec.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                rec.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              )}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={cn(
                    'w-5 h-5 mt-0.5',
                    rec.type === 'warning' ? 'text-yellow-500' :
                    rec.type === 'info' ? 'text-blue-500' :
                    'text-green-500'
                  )} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Recommendation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.message}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {sleepLogs.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Sleep & Energy Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" domain={[0, 12]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#6366F1" name="Sleep (h)" />
                <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#F59E0B" name="Energy" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Sleep vs Energy Correlation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sleep" />
                <YAxis dataKey="energy" domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="energy" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Recent Sleep Logs
        </h3>
        {sleepLogs.length === 0 ? (
          <EmptyState
            icon={<Moon className="w-8 h-8" />}
            title="No sleep logs yet"
            description="Start tracking your sleep to see insights"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Log Sleep
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentLogs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">{formatDate(log.date, 'EEE')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(log.date, 'MMM dd')}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.hours}h
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Battery className={cn(
                      'w-5 h-5',
                      log.energy >= 4 ? 'text-green-500' :
                      log.energy >= 2 ? 'text-yellow-500' : 'text-red-500'
                    )} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.energy}/5
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(log)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(log.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingLog ? 'Edit Sleep Log' : 'Log Sleep'}
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Hours of Sleep
            </label>
            <Input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Energy Level (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, energy: level })}
                  className={cn(
                    'flex-1 py-3 rounded-lg transition-colors',
                    formData.energy === level
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  )}
                >
                  <Battery className={cn(
                    'w-6 h-6 mx-auto mb-1',
                    level >= 4 ? 'text-green-500' :
                    level >= 2 ? 'text-yellow-500' : 'text-red-500',
                    formData.energy === level && 'text-white'
                  )} />
                  <span className="text-sm">{level}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingLog ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Log"
        message="Are you sure you want to delete this sleep log?"
      />
    </div>
  );
}
