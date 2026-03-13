'use client';

import { useState } from 'react';
import {
  Library, Plus, Trash2, Edit2, ExternalLink, Link, Book,
  Video, FileText, Search
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, EmptyState, Badge } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn, formatDate } from '../../lib/utils';
import { Resource, ResourceStatus } from '../../lib/types';

const RESOURCE_TYPES = [
  { value: 'link', label: 'Link/Website', icon: Link },
  { value: 'book', label: 'Book', icon: Book },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'pdf', label: 'PDF', icon: FileText },
];

export default function ResourcesPage() {
  const { subjects, resources, addResource, updateResource, deleteResource } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    type: 'link' as Resource['type'],
    url: '',
  });

  const filteredResources = resources
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || r.subjectId === filterSubject;
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesSubject && matchesType && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.title) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const resourceData: Resource = {
      id: editingResource?.id || generateId(),
      subjectId: formData.subjectId,
      title: formData.title,
      type: formData.type,
      url: formData.url || undefined,
      status: editingResource?.status || 'to-read',
      createdAt: editingResource?.createdAt || new Date().toISOString(),
    };

    if (editingResource) {
      updateResource(editingResource.id, resourceData);
      showToast('success', 'Resource updated');
    } else {
      addResource(resourceData);
      showToast('success', 'Resource added');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setFormData({
      subjectId: '',
      title: '',
      type: 'link',
      url: '',
    });
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      subjectId: resource.subjectId,
      title: resource.title,
      type: resource.type,
      url: resource.url || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteResource(id);
    setDeleteId(null);
    showToast('success', 'Resource deleted');
  };

  const handleStatusChange = (id: string, status: ResourceStatus) => {
    updateResource(id, { status });
    showToast('success', `Marked as ${status}`);
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';

  const getStatusBadge = (status: ResourceStatus) => {
    const variants = {
      'to-read': 'warning',
      'in-progress': 'info',
      'done': 'success',
    };
    const labels = {
      'to-read': 'To Read',
      'in-progress': 'In Progress',
      'done': 'Done',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getTypeIcon = (type: Resource['type']) => {
    const found = RESOURCE_TYPES.find(t => t.value === type);
    const Icon = found?.icon || Link;
    return <Icon className="w-4 h-4" />;
  };

  const statusCounts = {
    'to-read': resources.filter(r => r.status === 'to-read').length,
    'in-progress': resources.filter(r => r.status === 'in-progress').length,
    'done': resources.filter(r => r.status === 'done').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resource Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Save and organize study resources
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-yellow-500">{statusCounts['to-read']}</p>
          <p className="text-sm text-gray-500">To Read</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-500">{statusCounts['in-progress']}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-500">{statusCounts['done']}</p>
          <p className="text-sm text-gray-500">Done</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <Select
            value={filterSubject}
            onChange={setFilterSubject}
            options={[{ value: 'all', label: 'All Subjects' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
            className="w-40"
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            options={[{ value: 'all', label: 'All Types' }, ...RESOURCE_TYPES.map(t => ({ value: t.value, label: t.label }))]}
            className="w-40"
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'to-read', label: 'To Read' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ]}
            className="w-40"
          />
        </div>

        {filteredResources.length === 0 ? (
          <EmptyState
            icon={<Library className="w-8 h-8" />}
            title="No resources found"
            description="Add your first resource to get started"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Add Resource
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: getSubjectColor(resource.subjectId) }}
                  >
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getSubjectName(resource.subjectId)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(resource.status)}
                  <span className="text-xs text-gray-500">
                    {formatDate(resource.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {resource.url && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(resource)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(resource.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {(['to-read', 'in-progress', 'done'] as ResourceStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(resource.id, status)}
                      className={cn(
                        'flex-1 py-1 text-xs rounded transition-colors',
                        resource.status === status
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      {status === 'to-read' ? 'Read' : status === 'in-progress' ? 'Progress' : 'Done'}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
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
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., JavaScript Tutorial"
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(v) => setFormData({ ...formData, type: v as Resource['type'] })}
            options={RESOURCE_TYPES.map(t => ({ value: t.value, label: t.label }))}
          />

          <Input
            label="URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingResource ? 'Update' : 'Add Resource'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Resource"
        message="Are you sure you want to delete this resource?"
      />
    </div>
  );
}
