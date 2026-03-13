export type Priority = 'high' | 'medium' | 'low';
export type ExamStatus = 'upcoming' | 'completed' | 'missed';
export type ResourceStatus = 'to-read' | 'in-progress' | 'done';
export type HabitFrequency = 'daily' | 'weekly';
export type GoalType = 'short-term' | 'long-term';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  teacher?: string;
  credits?: number;
  room?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  syllabusTopics: string[];
  priority: Priority;
  status: ExamStatus;
  studyMaterials?: string;
  reminderDays: number;
  difficulty: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  duration: number;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  subjectId?: string;
  priority: Priority;
  completed: boolean;
  subtasks: Subtask[];
  recurring?: HabitFrequency;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface PomodoroSession {
  id: string;
  subjectId?: string;
  duration: number;
  type: 'study' | 'short-break' | 'long-break';
  completedAt: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  title: string;
  score: number;
  maxMarks: number;
  weightage: number;
  date: string;
  semester?: string;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: 'new' | 'known' | 'review';
  nextReview?: string;
}

export interface Note {
  id: string;
  subjectId?: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  subjectId?: string;
  frequency: HabitFrequency;
  targetDays: number[];
  completedDates: string[];
  createdAt: string;
}

export interface Resource {
  id: string;
  subjectId: string;
  title: string;
  type: 'link' | 'book' | 'video' | 'pdf';
  url?: string;
  status: ResourceStatus;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  type: GoalType;
  targetDate: string;
  milestones: Milestone[];
  achieved: boolean;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
}

export interface SleepLog {
  id: string;
  date: string;
  hours: number;
  energy: number;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  teacher?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  notifications: boolean;
  pomodoroWork: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
}

export interface Activity {
  id: string;
  type: 'task' | 'exam' | 'session' | 'grade' | 'habit';
  action: string;
  description: string;
  timestamp: string;
}

export const ACCENT_COLORS: Record<AccentColor, string> = {
  blue: '#3B82F6',
  purple: '#8B5CF6',
  green: '#10B981',
  orange: '#F97316',
  pink: '#EC4899',
  red: '#EF4444',
};

export const SUBJECT_ICONS = [
  'book', 'calculator', 'flask', 'globe', 'music', 'palette', 
  'code', 'microscope', 'brain', 'camera', 'lightbulb', 'star'
];

export const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent way possible.", author: "Richard Feynman" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
];
