'use client';

import { useState } from 'react';
import {
  Sparkles, Plus, Trash2, Edit2, Target, Trophy, Calendar, Flag,
  ChevronDown, ChevronRight, CheckCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, EmptyState, Badge, ProgressBar } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn, formatDate, getDaysUntil } from '../../lib/utils';
import { Goal, GoalType, Milestone } from '../../lib/types';
import confetti from 'canvas-confetti';

export default function GoalsPage() {
  const { subjects, goals, addGoal, updateGoal, deleteGoal } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    type: 'short-term' as GoalType,
    targetDate: '',
    milestones: [] as { title: string; deadline: string }[],
  });
  const [newMilestone, setNewMilestone] = useState({ title: '', deadline: '' });

  const handleSubmit = () => {
    if (!formData.title || !formData.targetDate) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const milestones: Milestone[] = formData.milestones.map(m => ({
      id: generateId(),
      title: m.title,
      deadline: m.deadline,
      completed: false,
    }));

    const goalData: Goal = {
      id: editingGoal?.id || generateId(),
      title: formData.title,
      description: formData.description || undefined,
      subjectId: formData.subjectId || undefined,
      type: formData.type,
      targetDate: formData.targetDate,
      milestones,
      achieved: editingGoal?.achieved || false,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
      showToast('success', 'Goal updated');
    } else {
      addGoal(goalData);
      showToast('success', 'Goal created');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      type: 'short-term',
      targetDate: '',
      milestones: [],
    });
    setNewMilestone({ title: '', deadline: '' });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      subjectId: goal.subjectId || '',
      type: goal.type,
      targetDate: goal.targetDate,
      milestones: goal.milestones.map(m => ({ title: m.title, deadline: m.deadline })),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    setDeleteId(null);
    showToast('success', 'Goal deleted');
  };

  const handleAchieve = (goal: Goal) => {
    updateGoal(goal.id, { achieved: !goal.achieved });
    if (!goal.achieved) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('success', 'Congratulations! Goal achieved!');
    }
  };

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.deadline) {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, { ...newMilestone }],
      });
      setNewMilestone({ title: '', deadline: '' });
    }
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    updateGoal(goalId, { milestones: updatedMilestones });
  };

  const getProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const getSubjectName = (id?: string) => id ? (subjects.find(s => s.id === id)?.name || 'Unknown') : '';

  const shortTermGoals = goals.filter(g => g.type === 'short-term');
  const longTermGoals = goals.filter(g => g.type === 'long-term');
  const achievedGoals = goals.filter(g => g.achieved);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Goal Setting
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Set and track your academic goals
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Set Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Flag className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Short-term</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {shortTermGoals.filter(g => !g.achieved).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Long-term</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {longTermGoals.filter(g => !g.achieved).length}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Achieved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {achievedGoals.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {goals.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Sparkles className="w-8 h-8" />}
            title="No goals yet"
            description="Set your first academic goal to start tracking progress"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Set Goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {['short-term', 'long-term'].map(type => {
            const typeGoals = goals.filter(g => g.type === type);
            if (typeGoals.length === 0) return null;
            
            return (
              <div key={type}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {type === 'short-term' ? '🎯 Short-term Goals' : '🏆 Long-term Goals'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeGoals.map(goal => {
                    const progress = getProgress(goal);
                    const daysLeft = getDaysUntil(goal.targetDate);
                    
                    return (
                      <Card key={goal.id} className={cn(
                        'hover:shadow-lg transition-all',
                        goal.achieved && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      )}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleAchieve(goal)}
                              className={cn(
                                'mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                                goal.achieved
                                  ? 'bg-green-500 text-white'
                                  : 'border-2 border-gray-300 dark:border-gray-600 hover:border-green-500'
                              )}
                            >
                              {goal.achieved && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <div>
                              <h3 className={cn(
                                'font-semibold',
                                goal.achieved ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                              )}>
                                {goal.title}
                              </h3>
                              {goal.subjectId && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {getSubjectName(goal.subjectId)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(goal)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteId(goal.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {goal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {goal.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <span className={cn(
                            daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-yellow-500' : 'text-gray-500'
                          )}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                          </span>
                          <span className="text-gray-500">
                            Due: {formatDate(goal.targetDate)}
                          </span>
                        </div>

                        {goal.milestones.length > 0 && (
                          <div>
                            <button
                              onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2"
                            >
                              {expandedGoal === goal.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                            </button>
                            
                            {expandedGoal === goal.id && (
                              <div className="space-y-2 pl-5">
                                {goal.milestones.map(milestone => (
                                  <div
                                    key={milestone.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <button
                                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                                    >
                                      {milestone.completed ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                      )}
                                    </button>
                                    <span className={cn(
                                      milestone.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                                    )}>
                                      {milestone.title}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-auto">
                                      {formatDate(milestone.deadline)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <ProgressBar value={progress} className="mt-4" showLabel />
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingGoal ? 'Edit Goal' : 'Set New Goal'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Goal Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Score 90% in Math"
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Goal Type"
              value={formData.type}
              onChange={(v) => setFormData({ ...formData, type: v as GoalType })}
              options={[
                { value: 'short-term', label: 'Short-term' },
                { value: 'long-term', label: 'Long-term' },
              ]}
            />
            <Input
              label="Target Date *"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
          </div>

          <Select
            label="Subject (optional)"
            value={formData.subjectId}
            onChange={(v) => setFormData({ ...formData, subjectId: v })}
            options={[{ value: '', label: 'No Subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Milestones
            </label>
            <div className="space-y-2 mb-3">
              {formData.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{m.title}</span>
                  <span className="text-xs text-gray-500">{formatDate(m.deadline)}</span>
                  <button onClick={() => removeMilestone(i)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Milestone title..."
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
              <Input
                type="date"
                value={newMilestone.deadline}
                onChange={(e) => setNewMilestone({ ...newMilestone, deadline: e.target.value })}
              />
              <Button variant="secondary" onClick={addMilestone}>Add</Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingGoal ? 'Update' : 'Set Goal'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
      />
    </div>
  );
}
