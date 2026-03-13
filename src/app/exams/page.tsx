'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, Search, Filter, Trash2, Edit2,
  Clock, MapPin, AlertCircle, Star, Calendar, X
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Textarea, Select, Badge, EmptyState } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { generateId, formatDate, getDaysUntil, cn, getPriorityColor, getStatusColor } from '../../lib/utils';
import { Exam, Priority, ExamStatus } from '../../lib/types';
import Link from 'next/link';

export default function ExamsPage() {
  const { subjects, exams, addExam, updateExam, deleteExam, addActivity } = useStore();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    date: '',
    time: '',
    location: '',
    syllabusTopics: '',
    priority: 'medium' as Priority,
    reminderDays: 3,
    difficulty: 3,
    studyMaterials: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setIsModalOpen(true);
    }
  }, []);

  const filteredExams = exams
    .filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || exam.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.title || !formData.date || !formData.time) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const examData: Exam = {
      id: editingExam?.id || generateId(),
      subjectId: formData.subjectId,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      syllabusTopics: formData.syllabusTopics.split('\n').filter(t => t.trim()),
      priority: formData.priority,
      status: editingExam?.status || 'upcoming',
      reminderDays: formData.reminderDays,
      difficulty: formData.difficulty,
      studyMaterials: formData.studyMaterials,
      createdAt: editingExam?.createdAt || new Date().toISOString(),
    };

    if (editingExam) {
      updateExam(editingExam.id, examData);
      showToast('success', 'Exam updated successfully');
    } else {
      addExam(examData);
      showToast('success', 'Exam added successfully');
      addActivity({
        id: generateId(),
        type: 'exam',
        action: 'added',
        description: `Added exam: ${examData.title}`,
        timestamp: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingExam(null);
    setFormData({
      subjectId: '',
      title: '',
      date: '',
      time: '',
      location: '',
      syllabusTopics: '',
      priority: 'medium',
      reminderDays: 3,
      difficulty: 3,
      studyMaterials: '',
    });
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      subjectId: exam.subjectId,
      title: exam.title,
      date: exam.date,
      time: exam.time,
      location: exam.location || '',
      syllabusTopics: exam.syllabusTopics.join('\n'),
      priority: exam.priority,
      reminderDays: exam.reminderDays,
      difficulty: exam.difficulty,
      studyMaterials: exam.studyMaterials || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExam(id);
    showToast('success', 'Exam deleted successfully');
  };

  const handleStatusChange = (id: string, status: ExamStatus) => {
    updateExam(id, { status });
    showToast('success', `Exam marked as ${status}`);
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';

  const getUpcomingExams = () => exams.filter(e => e.status === 'upcoming');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Exam Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your upcoming exams
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Exam
        </Button>
      </div>

      {getUpcomingExams().length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              Upcoming Exam Reminders
            </h3>
          </div>
          <div className="space-y-2">
            {getUpcomingExams()
              .filter(e => getDaysUntil(e.date) <= e.reminderDays && getDaysUntil(e.date) >= 0)
              .map(exam => (
                <p key={exam.id} className="text-sm text-blue-700 dark:text-blue-400">
                  {exam.title} ({getSubjectName(exam.subjectId)}) is in {getDaysUntil(exam.date)} days
                </p>
              ))}
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
              { value: 'missed', label: 'Missed' },
            ]}
            className="w-40"
          />
          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            className="w-40"
          />
        </div>

        {filteredExams.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-8 h-8" />}
            title="No exams found"
            description="Add your first exam to get started"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Add Exam
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredExams.map(exam => {
              const daysUntil = getDaysUntil(exam.date);
              return (
                <div
                  key={exam.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-1 h-full min-h-[80px] rounded-full"
                    style={{ backgroundColor: getSubjectColor(exam.subjectId) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getSubjectName(exam.subjectId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                        <Badge className={getPriorityColor(exam.priority)}>
                          {exam.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(exam.date, 'EEEE, MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.time}
                      </div>
                      {exam.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {exam.location}
                        </div>
                      )}
                    </div>

                    {exam.status === 'upcoming' && (
                      <div className="mt-3">
                        <span className={cn(
                          'text-sm font-semibold',
                          daysUntil <= 3 ? 'text-red-500' :
                          daysUntil <= 7 ? 'text-yellow-500' : 'text-green-500'
                        )}>
                          {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days left`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < exam.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'
                          )}
                        />
                      ))}
                    </div>

                    {exam.syllabusTopics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exam.syllabusTopics.slice(0, 3).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {topic}
                          </span>
                        ))}
                        {exam.syllabusTopics.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{exam.syllabusTopics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {exam.status === 'upcoming' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(exam.id, 'completed')}
                      >
                        Mark Done
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(exam)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(exam.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingExam ? 'Edit Exam' : 'Add New Exam'}
        size="lg"
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
            label="Exam Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Midterm Exam"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Time *"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Room 101"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(v) => setFormData({ ...formData, priority: v as Priority })}
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reminder (days before)
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={formData.reminderDays}
                onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Difficulty Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: star })}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= formData.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Syllabus Topics (one per line)"
            value={formData.syllabusTopics}
            onChange={(e) => setFormData({ ...formData, syllabusTopics: e.target.value })}
            placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
            rows={4}
          />

          <Textarea
            label="Study Materials / Notes"
            value={formData.studyMaterials}
            onChange={(e) => setFormData({ ...formData, studyMaterials: e.target.value })}
            placeholder="Add any study materials or notes..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingExam ? 'Update Exam' : 'Add Exam'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
