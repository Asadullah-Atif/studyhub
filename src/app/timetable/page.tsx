'use client';

import { useState, useMemo } from 'react';
import {
  Clock, Plus, Trash2, Edit2, Calendar, MapPin, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, EmptyState, Badge } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn, formatTime, getDaysUntil } from '../../lib/utils';
import { TimetableEntry } from '../../lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function TimetablePage() {
  const { subjects, timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [formData, setFormData] = useState({
    subjectId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    teacher: '',
  });

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.startTime || !formData.endTime) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showToast('error', 'End time must be after start time');
      return;
    }

    const entryData: TimetableEntry = {
      id: editingEntry?.id || generateId(),
      subjectId: formData.subjectId,
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room || undefined,
      teacher: formData.teacher || undefined,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
    };

    if (editingEntry) {
      updateTimetableEntry(editingEntry.id, entryData);
      showToast('success', 'Class updated');
    } else {
      addTimetableEntry(entryData);
      showToast('success', 'Class added');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormData({
      subjectId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      teacher: '',
    });
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      subjectId: entry.subjectId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || '',
      teacher: entry.teacher || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTimetableEntry(id);
    setDeleteId(null);
    showToast('success', 'Class removed');
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';

  const entriesForDay = timetable
    .filter(e => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nextClass = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let nextEntry = timetable.find(e => {
      if (e.dayOfWeek < currentDay) return false;
      if (e.dayOfWeek === currentDay && e.endTime <= currentTime) return false;
      return true;
    });

    if (!nextEntry) {
      const futureDays = timetable
        .filter(e => e.dayOfWeek > currentDay)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      if (futureDays.length > 0) {
        nextEntry = futureDays[0];
      }
    }

    return nextEntry;
  }, [timetable]);

  const getNextClassCountdown = () => {
    if (!nextClass) return null;
    
    const now = new Date();
    let daysUntil = nextClass.dayOfWeek - now.getDay();
    if (daysUntil < 0) daysUntil += 7;
    
    const [hours, minutes] = nextClass.startTime.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(hours, minutes, 0);
    
    if (daysUntil === 0 && classTime <= now) {
      daysUntil = 7;
    }
    
    return {
      subject: getSubjectName(nextClass.subjectId),
      day: DAYS[nextClass.dayOfWeek],
      time: formatTime(nextClass.startTime),
      daysUntil,
    };
  };

  const weeklySchedule = DAYS.map((day, dayIndex) => {
    const entries = timetable
      .filter(e => e.dayOfWeek === dayIndex)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return { day, dayIndex, entries };
  });

  const nextInfo = getNextClassCountdown();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Class Timetable
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Weekly class schedule
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Class
        </Button>
      </div>

      {nextInfo && (
        <Card className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Next Class</p>
              <p className="text-2xl font-bold">{nextInfo.subject}</p>
              <p className="text-white/90">
                {nextInfo.day} at {nextInfo.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{nextInfo.daysUntil}</p>
              <p className="text-white/80">days</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(i)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedDay === i
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {entriesForDay.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No classes on {DAYS[selectedDay]}</p>
                <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                  Add Class
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {entriesForDay.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-1 h-16 rounded-full"
                      style={{ backgroundColor: getSubjectColor(entry.subjectId) }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getSubjectName(entry.subjectId)}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                        </span>
                        {entry.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {entry.room}
                          </span>
                        )}
                        {entry.teacher && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {entry.teacher}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(entry.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Overview
            </h3>
            <div className="space-y-2">
              {weeklySchedule.map(({ day, dayIndex, entries }) => (
                <div
                  key={day}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg',
                    dayIndex === selectedDay && 'bg-[var(--accent)]/10'
                  )}
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                    {day.slice(0, 3)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {entries.length} class{entries.length !== 1 ? 'es' : ''}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingEntry ? 'Edit Class' : 'Add New Class'}
      >
        <div className="space-y-4">
          <Select
            label="Subject *"
            value={formData.subjectId}
            onChange={(v) => setFormData({ ...formData, subjectId: v })}
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select subject..."
          />

          <Select
            label="Day of Week"
            value={formData.dayOfWeek.toString()}
            onChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}
            options={DAYS.map((day, i) => ({ value: i.toString(), label: day }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time *"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label="End Time *"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          <Input
            label="Room"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Room 101"
          />

          <Input
            label="Teacher"
            value={formData.teacher}
            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
            placeholder="Dr. Smith"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingEntry ? 'Update' : 'Add Class'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Remove Class"
        message="Are you sure you want to remove this class from your timetable?"
      />
    </div>
  );
}
