'use client';

import { useState } from 'react';
import {
  Brain, Plus, Trash2, Edit2, RotateCcw, Shuffle,
  CheckCircle, XCircle, BookOpen, Upload, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Textarea, Select, Badge, EmptyState } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, cn, parseFlashcards } from '../../lib/utils';
import { FlashcardDeck, Flashcard } from '../../lib/types';

export default function FlashcardsPage() {
  const { subjects, flashcardDecks, addFlashcardDeck, updateFlashcardDeck, deleteFlashcardDeck } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    importText: '',
  });

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.title) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    let cards: Flashcard[] = [];
    
    if (formData.importText.trim()) {
      const parsedCards = parseFlashcards(formData.importText);
      cards = parsedCards.map(c => ({
        id: generateId(),
        front: c.front,
        back: c.back,
        status: 'new' as const,
      }));
    }

    const deckData: FlashcardDeck = {
      id: editingDeck?.id || generateId(),
      subjectId: formData.subjectId,
      title: formData.title,
      description: formData.description || undefined,
      cards: editingDeck?.cards || cards,
      createdAt: editingDeck?.createdAt || new Date().toISOString(),
    };

    if (editingDeck) {
      updateFlashcardDeck(editingDeck.id, deckData);
      showToast('success', 'Flashcard deck updated');
    } else {
      addFlashcardDeck(deckData);
      showToast('success', 'Flashcard deck created');
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingDeck(null);
    setFormData({
      subjectId: '',
      title: '',
      description: '',
      importText: '',
    });
  };

  const handleEdit = (deck: FlashcardDeck) => {
    setEditingDeck(deck);
    setFormData({
      subjectId: deck.subjectId,
      title: deck.title,
      description: deck.description || '',
      importText: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteFlashcardDeck(id);
    setDeleteId(null);
    showToast('success', 'Flashcard deck deleted');
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';

  const startStudy = (deck: FlashcardDeck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShuffled(false);
    setIsStudyMode(true);
  };

  const shuffleCards = () => {
    if (!currentDeck) return;
    const shuffledCards = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    updateFlashcardDeck(currentDeck.id, { cards: shuffledCards });
    setShuffled(true);
    setCurrentCardIndex(0);
  };

  const markCard = (status: 'known' | 'review') => {
    if (!currentDeck) return;
    const card = currentDeck.cards[currentCardIndex];
    const updatedCard = { ...card, status, nextReview: new Date().toISOString() };
    const updatedCards = currentDeck.cards.map((c, i) => i === currentCardIndex ? updatedCard : c);
    updateFlashcardDeck(currentDeck.id, { cards: updatedCards });

    if (currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      showToast('info', 'You\'ve reviewed all cards!');
      setIsStudyMode(false);
    }
  };

  const getDueCards = (deck: FlashcardDeck) => {
    const today = new Date().toISOString().split('T')[0];
    return deck.cards.filter(c => c.status === 'new' || c.nextReview?.startsWith(today));
  };

  const getStats = (deck: FlashcardDeck) => {
    const known = deck.cards.filter(c => c.status === 'known').length;
    const review = deck.cards.filter(c => c.status === 'review').length;
    const newCards = deck.cards.filter(c => c.status === 'new').length;
    return { known, review, new: newCards, total: deck.cards.length };
  };

  if (isStudyMode && currentDeck) {
    const card = currentDeck.cards[currentCardIndex];
    const stats = getStats(currentDeck);

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsStudyMode(false)}>
            <ChevronLeft className="w-5 h-5" />
            Back to Decks
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentCardIndex + 1} / {currentDeck.cards.length}
            </span>
            <Button variant="secondary" size="sm" onClick={shuffleCards}>
              <Shuffle className="w-4 h-4" />
              Shuffle
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Card className="flex-1 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.known}</p>
            <p className="text-sm text-gray-500">Known</p>
          </Card>
          <Card className="flex-1 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.review}</p>
            <p className="text-sm text-gray-500">Review</p>
          </Card>
          <Card className="flex-1 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.new}</p>
            <p className="text-sm text-gray-500">New</p>
          </Card>
        </div>

        <div className="flex justify-center">
          <div 
            className="flip-card w-full max-w-2xl h-80 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={cn('flip-card-inner relative w-full h-full', isFlipped && 'flipped')}>
              <div className="flip-card-front absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">Question</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
                  {card.front}
                </p>
                <p className="text-sm text-gray-400 mt-4">Click to flip</p>
              </div>
              <div className="flip-card-back absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 rounded-2xl p-8 flex flex-col items-center justify-center">
                <p className="text-xs uppercase tracking-wider text-white/70 mb-4">Answer</p>
                <p className="text-2xl font-semibold text-white text-center">
                  {card.back}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => markCard('review')}
            className="w-40"
          >
            <XCircle className="w-5 h-5" />
            Review Again
          </Button>
          <Button
            size="lg"
            onClick={() => markCard('known')}
            className="w-40"
          >
            <CheckCircle className="w-5 h-5" />
            Know It
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Flashcard Study
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and study flashcard decks
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Create Deck
        </Button>
      </div>

      {flashcardDecks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Brain className="w-8 h-8" />}
            title="No flashcard decks"
            description="Create your first flashcard deck to start studying"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Create Deck
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardDecks.map(deck => {
            const stats = getStats(deck);
            const dueCount = getDueCards(deck).length;
            
            return (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {deck.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getSubjectName(deck.subjectId)}
                    </p>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getSubjectColor(deck.subjectId) }}
                  />
                </div>

                {deck.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {deck.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {deck.cards.length} cards
                  </span>
                  {dueCount > 0 && (
                    <Badge variant="warning">{dueCount} due today</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(stats.known / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((stats.known / stats.total) * 100)}% known
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => startStudy(deck)}
                    disabled={deck.cards.length === 0}
                  >
                    <BookOpen className="w-4 h-4" />
                    Study
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(deck)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(deck.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDeck ? 'Edit Deck' : 'Create New Deck'}
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
            label="Deck Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Biology Vocabulary"
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description..."
          />

          <Textarea
            label="Import Cards (Optional)"
            value={formData.importText}
            onChange={(e) => setFormData({ ...formData, importText: e.target.value })}
            placeholder="Enter Q&A pairs, one per line:&#10;Question 1&#10;Answer 1&#10;Question 2&#10;Answer 2"
            rows={6}
          />

          <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Upload className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white">Import Format</p>
              <p>Enter questions and answers in pairs. Each question followed by its answer on a new line.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingDeck ? 'Update Deck' : 'Create Deck'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Deck"
        message="Are you sure you want to delete this flashcard deck?"
      />
    </div>
  );
}
