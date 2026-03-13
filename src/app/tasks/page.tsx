'use client';

import { useState, useEffect } from 'react';
import {
  ListTodo, Plus, Search, Filter, Trash2, Edit2, CheckCircle,
  Circle, AlertTriangle, ChevronDown, ChevronRight
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, Badge, EmptyState, ProgressBar } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, formatDate, cn, isOverdue, getPriorityColor } from '../../lib/utils';
import { Task, Priority, HabitFrequency } from '../../lib/types';

export default function TasksPage() {
  const { subjects, tasks, addTask, updateTask, deleteTask, addActivity } = useStore();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    subjectId: '',
    priority: 'medium' as Priority,
    recurring: '' as HabitFrequency | '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setIsModalOpen(true);
    }
  }, []);

  const filteredTasks = tasks
    .filter(task => {
      const today = new Date().toISOString().split('T')[0];
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'today' && task.dueDate === today) ||
        (filter === 'completed' && task.completed) ||
        (filter === 'overdue' && task.dueDate && isOverdue(task.dueDate) && !task.completed) ||
        (filter === 'high' && task.priority === 'high');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'subject') {
        return (a.subjectId || '').localeCompare(b.subjectId || '');
      }
      return 0;
    });

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0;

  const handleSubmit = () => {
    if (!formData.title) {
      showToast('error', 'Please enter a task title');
      return;
    }

    const taskData: Task = {
      id: editingTask?.id || generateId(),
      title: formData.title,
      dueDate: formData.dueDate || undefined,
      subjectId: formData.subjectId || undefined,
      priority: formData.priority,
      completed: editingTask?.completed || false,
      subtasks: editingTask?.subtasks || [],
      recurring: formData.recurring || undefined,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
      showToast('success', 'Task updated');
    } else {
      addTask(taskData);
      showToast('success', 'Task added');
      addActivity({
        id: generateId(),
        type: 'task',
        action: 'added',
        description: `Added task: ${taskData.title}`,
        timestamp: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      dueDate: '',
      subjectId: '',
      priority: 'medium',
      recurring: '',
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      dueDate: task.dueDate || '',
      subjectId: task.subjectId || '',
      priority: task.priority,
      recurring: task.recurring || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
    showToast('success', task.completed ? 'Task marked incomplete' : 'Task completed!');
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    setDeleteId(null);
    showToast('success', 'Task deleted');
  };

  const addSubtask = (taskId: string, title: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newSubtask = {
      id: generateId(),
      title,
      completed: false,
    };
    
    updateTask(taskId, { subtasks: [...task.subtasks, newSubtask] });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const getSubjectName = (id?: string) => id ? (subjects.find(s => s.id === id)?.name || 'Unknown') : '';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and track your tasks
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-500">{tasks.filter(t => t.completed).length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{tasks.filter(t => !t.completed).length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{completionRate}%</p>
          <ProgressBar value={completionRate} className="mt-2" />
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <Select
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'today', label: 'Today' },
              { value: 'completed', label: 'Completed' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'high', label: 'High Priority' },
            ]}
            className="w-40"
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'dueDate', label: 'Sort by Due Date' },
              { value: 'priority', label: 'Sort by Priority' },
              { value: 'subject', label: 'Sort by Subject' },
            ]}
            className="w-40"
          />
        </div>

        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="w-8 h-8" />}
            title="No tasks found"
            description="Add your first task to get started"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Add Task
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  'p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                  task.completed && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-[var(--accent)]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium',
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                      )}>
                        {task.title}
                      </span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.recurring && (
                        <Badge variant="info">{task.recurring}</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {task.dueDate && (
                        <span className={cn(
                          isOverdue(task.dueDate) && !task.completed ? 'text-red-500' : ''
                        )}>
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.subjectId && (
                        <span>📚 {getSubjectName(task.subjectId)}</span>
                      )}
                      {task.subtasks.length > 0 && (
                        <button
                          onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          className="flex items-center gap-1 hover:text-[var(--accent)]"
                        >
                          <ChevronDown className={cn(
                            'w-4 h-4 transition-transform',
                            expandedTask === task.id && 'rotate-180'
                          )} />
                          {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                        </button>
                      )}
                    </div>

                    {expandedTask === task.id && task.subtasks.length > 0 && (
                      <div className="mt-3 pl-8 space-y-2">
                        {task.subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-2">
                            <button onClick={() => toggleSubtask(task.id, subtask.id)}>
                              {subtask.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <span className={cn(
                              'text-sm',
                              subtask.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'
                            )}>
                              {subtask.title}
                            </span>
                            <button
                              onClick={() => deleteSubtask(task.id, subtask.id)}
                              className="ml-auto text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(task)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(task.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <div className="space-y-4">
          <Input
            label="Task Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What needs to be done?"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject"
              value={formData.subjectId}
              onChange={(v) => setFormData({ ...formData, subjectId: v })}
              options={[{ value: '', label: 'No Subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
            />
            <Select
              label="Recurring"
              value={formData.recurring}
              onChange={(v) => setFormData({ ...formData, recurring: v as HabitFrequency | '' })}
              options={[
                { value: '', label: 'One-time' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}
