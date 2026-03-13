'use client';

import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Trash2, Edit2, Pin, Archive,
  Download, Tag, X
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Textarea, Select, Badge, EmptyState } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, formatDate, cn, countWords } from '../../lib/utils';
import { Note } from '../../lib/types';

export default function NotesPage() {
  const { subjects, notes, addNote, updateNote, deleteNote } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    content: '',
    tags: [] as string[],
    pinned: false,
  });

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesSearch = 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSubject = selectedSubject === 'all' || note.subjectId === selectedSubject;
        const matchesArchived = showArchived ? note.archived : !note.archived;
        return matchesSearch && matchesSubject && matchesArchived;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, searchQuery, selectedSubject, showArchived]);

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      showToast('error', 'Please enter a title and content');
      return;
    }

    const wordCount = countWords(formData.content);
    const noteData: Note = {
      id: editingNote?.id || generateId(),
      subjectId: formData.subjectId || undefined,
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
      pinned: formData.pinned,
      archived: editingNote?.archived || false,
      wordCount,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingNote) {
      updateNote(editingNote.id, noteData);
      showToast('success', 'Note updated');
    } else {
      addNote(noteData);
      showToast('success', 'Note created');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({
      subjectId: '',
      title: '',
      content: '',
      tags: [],
      pinned: false,
    });
    setNewTag('');
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      subjectId: note.subjectId || '',
      title: note.title,
      content: note.content,
      tags: note.tags,
      pinned: note.pinned,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setDeleteId(null);
    showToast('success', 'Note deleted');
  };

  const handleArchive = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    updateNote(id, { archived: !note.archived });
    showToast('success', note.archived ? 'Note unarchived' : 'Note archived');
  };

  const handleTogglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    updateNote(id, { pinned: !note.pinned });
  };

  const exportNote = (note: Note) => {
    const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Note exported');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const getSubjectName = (id?: string) => id ? (subjects.find(s => s.id === id)?.name || 'Unknown') : '';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and organize your study notes
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          New Note
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <Select
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={[
              { value: 'all', label: 'All Subjects' },
              ...subjects.map(s => ({ value: s.id, label: s.name }))
            ]}
            className="w-40"
          />
          <Button
            variant={showArchived ? 'primary' : 'secondary'}
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-5 h-5" />
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </Button>
        </div>

        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No notes found"
            description="Create your first note to get started"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                New Note
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <Card
                key={note.id}
                className={cn(
                  'hover:shadow-lg transition-all cursor-pointer',
                  note.pinned && 'ring-2 ring-[var(--accent)]'
                )}
                onClick={() => handleEdit(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                    {note.pinned && <Pin className="w-4 h-4 inline mr-1 text-[var(--accent)]" />}
                    {note.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {note.content}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="default">#{tag}</Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="default">+{note.tags.length - 3}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{note.wordCount} words</span>
                  <span>{formatDate(note.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                  >
                    <Pin className={cn('w-4 h-4', note.pinned && 'text-[var(--accent)]')} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); exportNote(note); }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleArchive(note.id); }}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(note.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Note title..."
          />

          <Select
            label="Subject"
            value={formData.subjectId}
            onChange={(v) => setFormData({ ...formData, subjectId: v })}
            options={[{ value: '', label: 'No Subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
          />

          <Textarea
            label="Content *"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your note here..."
            rows={12}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} className="flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button variant="secondary" onClick={addTag}>
                <Tag className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="pinned" className="text-sm text-gray-700 dark:text-gray-300">
              Pin this note to top
            </label>
          </div>

          {formData.content && (
            <p className="text-sm text-gray-500">
              {countWords(formData.content)} words
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingNote ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
}
