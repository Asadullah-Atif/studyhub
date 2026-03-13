'use client';

import { useState, useMemo } from 'react';
import {
  Target, Plus, Trash2, Edit2, Flame, Trophy, Calendar,
  CheckCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, EmptyState, Badge, ProgressBar } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn, getStreakBadge, formatDate } from '../../lib/utils';
import { Habit, HabitFrequency } from '../../lib/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitsPage() {
  const { subjects, habits, addHabit, updateHabit, deleteHabit, addActivity } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    frequency: 'daily' as HabitFrequency,
    targetDays: [0, 1, 2, 3, 4, 5, 6] as number[],
  });

  const today = new Date().toISOString().split('T')[0];
  const todayDayOfWeek = new Date().getDay();

  const handleSubmit = () => {
    if (!formData.title) {
      showToast('error', 'Please enter a habit title');
      return;
    }

    const habitData: Habit = {
      id: editingHabit?.id || generateId(),
      title: formData.title,
      subjectId: formData.subjectId || undefined,
      frequency: formData.frequency,
      targetDays: formData.targetDays,
      completedDates: editingHabit?.completedDates || [],
      createdAt: editingHabit?.createdAt || new Date().toISOString(),
    };

    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
      showToast('success', 'Habit updated');
    } else {
      addHabit(habitData);
      showToast('success', 'Habit created');
      addActivity({
        id: generateId(),
        type: 'habit',
        action: 'added',
        description: `Created habit: ${habitData.title}`,
        timestamp: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
    setFormData({
      title: '',
      subjectId: '',
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
    });
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      subjectId: habit.subjectId || '',
      frequency: habit.frequency,
      targetDays: habit.targetDays,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteHabit(id);
    setDeleteId(null);
    showToast('success', 'Habit deleted');
  };

  const toggleDay = (day: number) => {
    const newDays = formData.targetDays.includes(day)
      ? formData.targetDays.filter(d => d !== day)
      : [...formData.targetDays, day].sort();
    setFormData({ ...formData, targetDays: newDays });
  };

  const toggleHabitCompletion = (habit: Habit) => {
    const isCompletedToday = habit.completedDates.includes(today);
    let newCompletedDates: string[];

    if (isCompletedToday) {
      newCompletedDates = habit.completedDates.filter(d => d !== today);
    } else {
      newCompletedDates = [...habit.completedDates, today];
    }

    updateHabit(habit.id, { completedDates: newCompletedDates });
    
    if (!isCompletedToday) {
      showToast('success', 'Habit completed for today!');
      addActivity({
        id: generateId(),
        type: 'habit',
        action: 'completed',
        description: `Completed: ${habit.title}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getHeatmapData = (habit: Habit) => {
    const data = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        completed: habit.completedDates.includes(dateStr),
      });
    }
    
    return data;
  };

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const checkDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  };

  const getCompletionRate = (habit: Habit) => {
    const daysSinceCreation = Math.min(
      30,
      Math.floor((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );
    
    if (daysSinceCreation === 0) return 0;
    
    const completedCount = habit.completedDates.filter(d => {
      const date = new Date(d);
      const created = new Date(habit.createdAt);
      return date >= created && date <= new Date();
    }).length;
    
    return Math.round((completedCount / daysSinceCreation) * 100);
  };

  const overallStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => getStreak(h)));
  }, [habits]);

  const streakBadge = getStreakBadge(overallStreak);

  const todayHabits = habits.filter(h => h.targetDays.includes(todayDayOfWeek));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Habit Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Build consistent study habits
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStreak} {streakBadge.emoji}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Badge</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {streakBadge.label}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Habits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habits.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayHabits.filter(h => h.completedDates.includes(today)).length}/{todayHabits.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Today&apos;s Habits
        </h3>
        {todayHabits.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No habits scheduled for today
          </p>
        ) : (
          <div className="space-y-3">
            {todayHabits.map(habit => {
              const isCompleted = habit.completedDates.includes(today);
              
              return (
                <div
                  key={habit.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg transition-all',
                    isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <button
                    onClick={() => toggleHabitCompletion(habit)}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-gray-300 dark:border-gray-600 hover:border-green-500'
                    )}
                  >
                    {isCompleted && <CheckCircle className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1">
                    <span className={cn(
                      'font-medium',
                      isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                    )}>
                      {habit.title}
                    </span>
                  </div>
                  
                  <Badge variant={isCompleted ? 'success' : 'default'}>
                    {isCompleted ? 'Done' : 'Pending'}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(habit)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(habit.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {habits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {habits.map(habit => {
            const heatmapData = getHeatmapData(habit);
            const streak = getStreak(habit);
            const completionRate = getCompletionRate(habit);
            
            return (
              <Card key={habit.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {habit.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {habit.frequency} • {streak} day streak
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {DAYS_OF_WEEK.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newHabit = {
                          ...habit,
                          targetDays: habit.targetDays.includes(i)
                            ? habit.targetDays.filter(d => d !== i)
                            : [...habit.targetDays, i].sort()
                        };
                        updateHabit(habit.id, { targetDays: newHabit.targetDays });
                      }}
                      className={cn(
                        'flex-1 py-1 text-xs rounded transition-colors',
                        habit.targetDays.includes(i)
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      )}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {heatmapData.slice(-60).map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-sm heatmap-cell',
                        day.completed
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                      title={`${day.date}: ${day.completed ? 'Completed' : 'Not completed'}`}
                    />
                  ))}
                </div>

                <ProgressBar value={completionRate} className="mt-4" showLabel />
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingHabit ? 'Edit Habit' : 'Add New Habit'}
      >
        <div className="space-y-4">
          <Input
            label="Habit Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Study Math for 30 min"
          />

          <Select
            label="Frequency"
            value={formData.frequency}
            onChange={(v) => setFormData({ ...formData, frequency: v as HabitFrequency })}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
            ]}
          />

          <Select
            label="Subject (optional)"
            value={formData.subjectId}
            onChange={(v) => setFormData({ ...formData, subjectId: v })}
            options={[{ value: '', label: 'No Subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Target Days
            </label>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    'flex-1 py-2 text-sm rounded-lg transition-colors',
                    formData.targetDays.includes(i)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {day[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingHabit ? 'Update' : 'Add Habit'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Habit"
        message="Are you sure you want to delete this habit?"
      />
    </div>
  );
}
