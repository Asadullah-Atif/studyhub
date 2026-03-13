import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Subject, Exam, StudySession, Task, PomodoroSession, Grade,
  FlashcardDeck, Note, Habit, Resource, Goal, SleepLog, TimetableEntry,
  ChatMessage, AppSettings, Activity, ACCENT_COLORS
} from './types';

interface AppState {
  subjects: Subject[];
  exams: Exam[];
  studySessions: StudySession[];
  tasks: Task[];
  pomodoroSessions: PomodoroSession[];
  grades: Grade[];
  flashcardDecks: FlashcardDeck[];
  notes: Note[];
  habits: Habit[];
  resources: Resource[];
  goals: Goal[];
  sleepLogs: SleepLog[];
  timetable: TimetableEntry[];
  chatHistory: ChatMessage[];
  activities: Activity[];
  settings: AppSettings;

  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addExam: (exam: Exam) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, session: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addPomodoroSession: (session: PomodoroSession) => void;

  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, grade: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;

  addFlashcardDeck: (deck: FlashcardDeck) => void;
  updateFlashcardDeck: (id: string, deck: Partial<FlashcardDeck>) => void;
  deleteFlashcardDeck: (id: string) => void;

  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;

  addResource: (resource: Resource) => void;
  updateResource: (id: string, resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addSleepLog: (log: SleepLog) => void;
  updateSleepLog: (id: string, log: Partial<SleepLog>) => void;

  addTimetableEntry: (entry: TimetableEntry) => void;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;

  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;

  addActivity: (activity: Activity) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;

  getSubjectById: (id: string) => Subject | undefined;
  getExamCountdown: (examId: string) => number;
  getTaskCompletionRate: () => number;
  getTotalStudyHours: (days: number) => number;
  getStreak: () => number;
  getCumulativeGPA: () => number;
  getSubjectGPA: (subjectId: string) => number;

  exportData: () => string;
  importData: (data: string) => boolean;
  resetAllData: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  accentColor: 'blue',
  fontSize: 'medium',
  notifications: true,
  pomodoroWork: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      subjects: [],
      exams: [],
      studySessions: [],
      tasks: [],
      pomodoroSessions: [],
      grades: [],
      flashcardDecks: [],
      notes: [],
      habits: [],
      resources: [],
      goals: [],
      sleepLogs: [],
      timetable: [],
      chatHistory: [],
      activities: [],
      settings: defaultSettings,

      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, subject]
      })),

      updateSubject: (id, subject) => set((state) => ({
        subjects: state.subjects.map((s) =>
          s.id === id ? { ...s, ...subject } : s
        )
      })),

      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id)
      })),

      addExam: (exam) => set((state) => ({
        exams: [...state.exams, exam]
      })),

      updateExam: (id, exam) => set((state) => ({
        exams: state.exams.map((e) =>
          e.id === id ? { ...e, ...exam } : e
        )
      })),

      deleteExam: (id) => set((state) => ({
        exams: state.exams.filter((e) => e.id !== id)
      })),

      addStudySession: (session) => set((state) => ({
        studySessions: [...state.studySessions, session]
      })),

      updateStudySession: (id, session) => set((state) => ({
        studySessions: state.studySessions.map((s) =>
          s.id === id ? { ...s, ...session } : s
        )
      })),

      deleteStudySession: (id) => set((state) => ({
        studySessions: state.studySessions.filter((s) => s.id !== id)
      })),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),

      updateTask: (id, task) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...task } : t
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      addPomodoroSession: (session) => set((state) => ({
        pomodoroSessions: [...state.pomodoroSessions, session]
      })),

      addGrade: (grade) => set((state) => ({
        grades: [...state.grades, grade]
      })),

      updateGrade: (id, grade) => set((state) => ({
        grades: state.grades.map((g) =>
          g.id === id ? { ...g, ...grade } : g
        )
      })),

      deleteGrade: (id) => set((state) => ({
        grades: state.grades.filter((g) => g.id !== id)
      })),

      addFlashcardDeck: (deck) => set((state) => ({
        flashcardDecks: [...state.flashcardDecks, deck]
      })),

      updateFlashcardDeck: (id, deck) => set((state) => ({
        flashcardDecks: state.flashcardDecks.map((d) =>
          d.id === id ? { ...d, ...deck } : d
        )
      })),

      deleteFlashcardDeck: (id) => set((state) => ({
        flashcardDecks: state.flashcardDecks.filter((d) => d.id !== id)
      })),

      addNote: (note) => set((state) => ({
        notes: [...state.notes, note]
      })),

      updateNote: (id, note) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...note } : n
        )
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      })),

      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, habit]
      })),

      updateHabit: (id, habit) => set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, ...habit } : h
        )
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id)
      })),

      addResource: (resource) => set((state) => ({
        resources: [...state.resources, resource]
      })),

      updateResource: (id, resource) => set((state) => ({
        resources: state.resources.map((r) =>
          r.id === id ? { ...r, ...resource } : r
        )
      })),

      deleteResource: (id) => set((state) => ({
        resources: state.resources.filter((r) => r.id !== id)
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
      })),

      updateGoal: (id, goal) => set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, ...goal } : g
        )
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      })),

      addSleepLog: (log) => set((state) => ({
        sleepLogs: [...state.sleepLogs, log]
      })),

      updateSleepLog: (id, log) => set((state) => ({
        sleepLogs: state.sleepLogs.map((s) =>
          s.id === id ? { ...s, ...log } : s
        )
      })),

      addTimetableEntry: (entry) => set((state) => ({
        timetable: [...state.timetable, entry]
      })),

      updateTimetableEntry: (id, entry) => set((state) => ({
        timetable: state.timetable.map((t) =>
          t.id === id ? { ...t, ...entry } : t
        )
      })),

      deleteTimetableEntry: (id) => set((state) => ({
        timetable: state.timetable.filter((t) => t.id !== id)
      })),

      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message]
      })),

      clearChatHistory: () => set({ chatHistory: [] }),

      addActivity: (activity) => set((state) => ({
        activities: [activity, ...state.activities].slice(0, 50)
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      getSubjectById: (id) => get().subjects.find((s) => s.id === id),

      getExamCountdown: (examId) => {
        const exam = get().exams.find((e) => e.id === examId);
        if (!exam) return 0;
        const examDate = new Date(exam.date);
        const now = new Date();
        return Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      },

      getTaskCompletionRate: () => {
        const { tasks } = get();
        if (tasks.length === 0) return 0;
        const completed = tasks.filter((t) => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
      },

      getTotalStudyHours: (days) => {
        const { pomodoroSessions, studySessions } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const pomodoroHours = pomodoroSessions
          .filter((s) => new Date(s.completedAt) >= cutoffDate && s.type === 'study')
          .reduce((sum, s) => sum + s.duration, 0) / 60;

        const sessionHours = studySessions
          .filter((s) => new Date(s.date) >= cutoffDate && s.completed)
          .reduce((sum, s) => sum + s.duration, 0) / 60;

        return Math.round((pomodoroHours + sessionHours) * 10) / 10;
      },

      getStreak: () => {
        const { habits, activities } = get();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];

          const hasActivity = activities.some(
            (a) => a.timestamp.startsWith(dateStr) && 
            (a.type === 'session' || a.type === 'habit')
          );

          if (hasActivity) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        return streak;
      },

      getCumulativeGPA: () => {
        const { grades } = get();
        if (grades.length === 0) return 0;

        const totalWeightage = grades.reduce((sum, g) => sum + g.weightage, 0);
        if (totalWeightage === 0) return 0;

        const weightedSum = grades.reduce((sum, g) => {
          const percentage = (g.score / g.maxMarks) * 100;
          const gradePoints = getGradePoints(percentage);
          return sum + (gradePoints * g.weightage);
        }, 0);

        return Math.round((weightedSum / totalWeightage) * 100) / 100;
      },

      getSubjectGPA: (subjectId) => {
        const { grades } = get();
        const subjectGrades = grades.filter((g) => g.subjectId === subjectId);
        
        if (subjectGrades.length === 0) return 0;

        const totalWeightage = subjectGrades.reduce((sum, g) => sum + g.weightage, 0);
        if (totalWeightage === 0) return 0;

        const weightedSum = subjectGrades.reduce((sum, g) => {
          const percentage = (g.score / g.maxMarks) * 100;
          const gradePoints = getGradePoints(percentage);
          return sum + (gradePoints * g.weightage);
        }, 0);

        return Math.round((weightedSum / totalWeightage) * 100) / 100;
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          subjects: state.subjects,
          exams: state.exams,
          studySessions: state.studySessions,
          tasks: state.tasks,
          pomodoroSessions: state.pomodoroSessions,
          grades: state.grades,
          flashcardDecks: state.flashcardDecks,
          notes: state.notes,
          habits: state.habits,
          resources: state.resources,
          goals: state.goals,
          sleepLogs: state.sleepLogs,
          timetable: state.timetable,
          settings: state.settings,
        }, null, 2);
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            subjects: parsed.subjects || [],
            exams: parsed.exams || [],
            studySessions: parsed.studySessions || [],
            tasks: parsed.tasks || [],
            pomodoroSessions: parsed.pomodoroSessions || [],
            grades: parsed.grades || [],
            flashcardDecks: parsed.flashcardDecks || [],
            notes: parsed.notes || [],
            habits: parsed.habits || [],
            resources: parsed.resources || [],
            goals: parsed.goals || [],
            sleepLogs: parsed.sleepLogs || [],
            timetable: parsed.timetable || [],
            settings: { ...defaultSettings, ...parsed.settings },
          });
          return true;
        } catch {
          return false;
        }
      },

      resetAllData: () => {
        set({
          subjects: [],
          exams: [],
          studySessions: [],
          tasks: [],
          pomodoroSessions: [],
          grades: [],
          flashcardDecks: [],
          notes: [],
          habits: [],
          resources: [],
          goals: [],
          sleepLogs: [],
          timetable: [],
          chatHistory: [],
          activities: [],
          settings: defaultSettings,
        });
      },
    }),
    {
      name: 'study-app-storage',
    }
  )
);

function getGradePoints(percentage: number): number {
  if (percentage >= 95) return 4.3;
  if (percentage >= 90) return 4.0;
  if (percentage >= 85) return 3.7;
  if (percentage >= 80) return 3.3;
  if (percentage >= 75) return 3.0;
  if (percentage >= 70) return 2.7;
  if (percentage >= 65) return 2.3;
  if (percentage >= 60) return 2.0;
  if (percentage >= 55) return 1.7;
  if (percentage >= 50) return 1.0;
  return 0.0;
}

export function getLetterGrade(percentage: number): string {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'A-';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'C-';
  if (percentage >= 50) return 'D';
  return 'F';
}
