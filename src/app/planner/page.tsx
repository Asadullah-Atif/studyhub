'use client';

import { useState } from 'react';
import {
  Calendar, Plus, GripVertical, Trash2, Edit2, CheckCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, EmptyState, Badge } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { generateId, formatDate, cn } from '../../lib/utils';
import { StudySession } from '../../lib/types';

export default function PlannerPage() {
  const { subjects, studySessions, addStudySession, updateStudySession, deleteStudySession, exams, addActivity } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    date: '',
    duration: 60,
    notes: '',
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeek);
      date.setDate(selectedWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getSessionsForDate = (date: string) => {
    return studySessions.filter(s => s.date === date);
  };

  const getUpcomingExamsForDate = (date: string) => {
    return exams.filter(e => e.date === date && e.status === 'upcoming');
  };

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.date || !formData.title) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const sessionData: StudySession = {
      id: editingSession?.id || generateId(),
      subjectId: formData.subjectId,
      title: formData.title,
      date: formData.date,
      duration: formData.duration,
      notes: formData.notes,
      completed: editingSession?.completed || false,
      createdAt: editingSession?.createdAt || new Date().toISOString(),
    };

    if (editingSession) {
      updateStudySession(editingSession.id, sessionData);
      showToast('success', 'Study session updated');
    } else {
      addStudySession(sessionData);
      showToast('success', 'Study session added');
      addActivity({
        id: generateId(),
        type: 'session',
        action: 'added',
        description: `Added study session: ${sessionData.title}`,
        timestamp: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingSession(null);
    setFormData({
      subjectId: '',
      title: '',
      date: weekDates[0],
      duration: 60,
      notes: '',
    });
  };

  const handleEdit = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      subjectId: session.subjectId,
      title: session.title,
      date: session.date,
      duration: session.duration,
      notes: session.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleComplete = (session: StudySession) => {
    updateStudySession(session.id, { completed: !session.completed });
    showToast('success', session.completed ? 'Session marked as incomplete' : 'Session completed!');
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() + direction * 7);
    setSelectedWeek(newWeek);
  };

  const getTotalHoursForWeek = () => {
    const weekSessions = studySessions.filter(s => weekDates.includes(s.date));
    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const completedHours = () => {
    const weekSessions = studySessions.filter(s => weekDates.includes(s.date) && s.completed);
    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Study Planner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Plan and track your weekly study sessions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {getTotalHoursForWeek()} hours
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {completedHours()} hours
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(parseFloat(getTotalHours()) - parseFloat(completedHours())).toFixed(1)} hours
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigateWeek(-1)}>
            &larr; Previous
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDate(weekDates[0], 'MMM dd')} - {formatDate(weekDates[6], 'MMM dd, yyyy')}
          </h2>
          <Button variant="ghost" onClick={() => navigateWeek(1)}>
            Next &rarr;
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const sessions = getSessionsForDate(date);
            const exams = getUpcomingExamsForDate(date);
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={date}
                className={cn(
                  'min-h-[300px] p-2 rounded-lg border transition-all',
                  isToday
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                )}
              >
                <div className="text-center mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {weekDays[i]}
                  </p>
                  <p className={cn(
                    'text-lg font-bold',
                    isToday ? 'text-[var(--accent)]' : 'text-gray-900 dark:text-white'
                  )}>
                    {new Date(date).getDate()}
                  </p>
                </div>

                <div className="space-y-2">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={cn(
                        'p-2 rounded-lg text-xs cursor-pointer hover:opacity-80 transition-opacity',
                        session.completed ? 'bg-gray-200 dark:bg-gray-700' : ''
                      )}
                      style={{ backgroundColor: getSubjectColor(session.subjectId) + '20', borderLeft: `3px solid ${getSubjectColor(session.subjectId)}` }}
                      onClick={() => handleEdit(session)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {session.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(session);
                          }}
                        >
                          <CheckCircle className={cn(
                            'w-4 h-4',
                            session.completed ? 'text-green-500' : 'text-gray-400'
                          )} />
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {session.duration} min
                      </p>
                    </div>
                  ))}

                  {exams.map(exam => (
                    <div
                      key={exam.id}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs border border-red-200 dark:border-red-800"
                    >
                      <p className="font-medium text-red-700 dark:text-red-400 truncate">
                        📚 {exam.title}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setFormData({ ...formData, date });
                    setIsModalOpen(true);
                  }}
                  className="w-full mt-2 p-1 text-xs text-gray-500 hover:text-[var(--accent)] transition-colors"
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingSession ? 'Edit Study Session' : 'Add Study Session'}
      >
        <div className="space-y-4">
          <Select
            label="Subject *"
            value={formData.subjectId}
            onChange={(v) => setFormData({ ...formData, subjectId: v })}
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select subject..."
          />

          <Input
            label="Session Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Review Chapter 5"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Duration (minutes)
              </label>
              <Input
                type="number"
                min={15}
                step={15}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any notes for this session..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSession ? 'Update' : 'Add Session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getTotalHours() {
  return "0";
}
