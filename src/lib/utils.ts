import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatRelativeDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function getDateLabel(date: string): string {
  const parsedDate = parseISO(date);
  if (isToday(parsedDate)) return 'Today';
  if (isTomorrow(parsedDate)) return 'Tomorrow';
  return format(parsedDate, 'EEEE, MMM dd');
}

export function isOverdue(date: string): boolean {
  return isPast(parseISO(date)) && !isToday(parseISO(date));
}

export function getDaysUntil(date: string): number {
  return differenceInDays(parseISO(date), new Date());
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function parseFlashcards(text: string): { front: string; back: string }[] {
  const cards: { front: string; back: string }[] = [];
  const lines = text.split('\n').filter((line) => line.trim());

  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      cards.push({
        front: lines[i].trim(),
        back: lines[i + 1].trim(),
      });
    }
  }

  return cards;
}

export function getHeatmapColor(count: number, max: number): string {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
  const intensity = Math.ceil((count / max) * 4);
  const colors = [
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-300 dark:bg-emerald-700',
    'bg-emerald-400 dark:bg-emerald-500',
    'bg-emerald-500 dark:bg-emerald-400',
  ];
  return colors[Math.min(intensity - 1, 3)];
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  const colors = {
    high: 'text-red-500 bg-red-50 dark:bg-red-900/30',
    medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30',
    low: 'text-green-500 bg-green-50 dark:bg-green-900/30',
  };
  return colors[priority];
}

export function getStatusColor(status: 'upcoming' | 'completed' | 'missed'): string {
  const colors = {
    upcoming: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
    completed: 'text-green-500 bg-green-50 dark:bg-green-900/30',
    missed: 'text-red-500 bg-red-50 dark:bg-red-900/30',
  };
  return colors[status];
}

export function getStreakBadge(streak: number): { emoji: string; label: string } {
  if (streak >= 365) return { emoji: '👑', label: 'Legend' };
  if (streak >= 180) return { emoji: '🎖️', label: 'Master' };
  if (streak >= 100) return { emoji: '⭐', label: 'Expert' };
  if (streak >= 60) return { emoji: '🏆', label: 'Champion' };
  if (streak >= 30) return { emoji: '🔥', label: 'Dedicated' };
  if (streak >= 14) return { emoji: '💪', label: 'Strong' };
  if (streak >= 7) return { emoji: '🌟', label: 'Steady' };
  return { emoji: '🌱', label: 'Starter' };
}
