'use client';

import { useState } from 'react';
import {
  BookOpen, Plus, Trash2, Edit2, GraduationCap, User, MapPin,
  CreditCard, CheckCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, EmptyState, ProgressBar, Badge } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn } from '../../lib/utils';
import { Subject, SUBJECT_ICONS } from '../../lib/types';

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#6B7280', '#1F2937'
];

export default function SubjectsPage() {
  const { subjects, exams, grades, tasks, notes, resources, addSubject, updateSubject, deleteSubject, getSubjectGPA } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: COLORS[0],
    icon: SUBJECT_ICONS[0],
    teacher: '',
    credits: 3,
    room: '',
  });

  const handleSubmit = () => {
    if (!formData.name) {
      showToast('error', 'Please enter a subject name');
      return;
    }

    const subjectData: Subject = {
      id: editingSubject?.id || generateId(),
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
      teacher: formData.teacher || undefined,
      credits: formData.credits,
      room: formData.room || undefined,
      createdAt: editingSubject?.createdAt || new Date().toISOString(),
    };

    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData);
      showToast('success', 'Subject updated');
    } else {
      addSubject(subjectData);
      showToast('success', 'Subject added');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      color: COLORS[0],
      icon: SUBJECT_ICONS[0],
      teacher: '',
      credits: 3,
      room: '',
    });
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      teacher: subject.teacher || '',
      credits: subject.credits || 3,
      room: subject.room || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteSubject(id);
    setDeleteId(null);
    showToast('success', 'Subject deleted');
  };

  const getSubjectStats = (subjectId: string) => {
    const subjectExams = exams.filter(e => e.subjectId === subjectId);
    const upcomingExams = subjectExams.filter(e => e.status === 'upcoming').length;
    const completedExams = subjectExams.filter(e => e.status === 'completed').length;
    
    const subjectGrades = grades.filter(g => g.subjectId === subjectId);
    const gpa = getSubjectGPA(subjectId);
    
    const subjectTasks = tasks.filter(t => t.subjectId === subjectId);
    const completedTasks = subjectTasks.filter(t => t.completed).length;
    const pendingTasks = subjectTasks.length - completedTasks;
    
    const subjectNotes = notes.filter(n => n.subjectId === subjectId).length;
    const subjectResources = resources.filter(r => r.subjectId === subjectId).length;

    return {
      exams: subjectExams.length,
      upcomingExams,
      completedExams,
      gpa,
      tasks: subjectTasks.length,
      completedTasks,
      pendingTasks,
      notes: subjectNotes,
      resources: subjectResources,
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subject Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your courses and subjects
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="No subjects yet"
            description="Add your first subject to start organizing your studies"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Add Subject
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const stats = getSubjectStats(subject.id);
            
            return (
              <Card key={subject.id} className="hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: subject.color }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {subject.name}
                    </h3>
                    {subject.teacher && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {subject.teacher}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(subject)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(subject.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {subject.room && (
                    <Badge variant="default">
                      <MapPin className="w-3 h-3 mr-1" />
                      {subject.room}
                    </Badge>
                  )}
                  {subject.credits && (
                    <Badge variant="default">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {subject.credits} cr
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">Exams</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.upcomingExams} upcoming
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">GPA</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.gpa.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">Tasks</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.pendingTasks} pending
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stats.notes}
                    </p>
                  </div>
                </div>

                {stats.tasks > 0 && (
                  <div className="mt-4">
                    <ProgressBar
                      value={stats.completedTasks}
                      max={stats.tasks}
                      showLabel
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <div className="space-y-4">
          <Input
            label="Subject Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mathematics"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-transform',
                    formData.color === color && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teacher/Instructor"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              placeholder="Dr. Smith"
            />
            <Input
              label="Credits"
              type="number"
              min={1}
              max={10}
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
            />
          </div>

          <Input
            label="Room/Location"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Room 101"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSubject ? 'Update' : 'Add Subject'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This will not delete related exams, grades, or tasks."
      />
    </div>
  );
}
