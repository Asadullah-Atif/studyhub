import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabase, isSupabaseConfigured } from './supabase';
import {
  Subject, Exam, StudySession, Task, PomodoroSession, Grade,
  FlashcardDeck, Note, Habit, Resource, Goal, SleepLog, TimetableEntry,
  ChatMessage, AppSettings, Activity
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
  loading: boolean;
  initialized: boolean;
  userId: string | null;

  initialize: (userId: string) => Promise<void>;
  
  addSubject: (subject: Subject) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  addExam: (exam: Exam) => Promise<void>;
  updateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;

  addStudySession: (session: StudySession) => Promise<void>;
  updateStudySession: (id: string, session: Partial<StudySession>) => Promise<void>;
  deleteStudySession: (id: string) => Promise<void>;

  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addPomodoroSession: (session: PomodoroSession) => Promise<void>;

  addGrade: (grade: Grade) => Promise<void>;
  updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;

  addFlashcardDeck: (deck: FlashcardDeck) => Promise<void>;
  updateFlashcardDeck: (id: string, deck: Partial<FlashcardDeck>) => Promise<void>;
  deleteFlashcardDeck: (id: string) => Promise<void>;

  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  addResource: (resource: Resource) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addSleepLog: (log: SleepLog) => Promise<void>;
  updateSleepLog: (id: string, log: Partial<SleepLog>) => Promise<void>;

  addTimetableEntry: (entry: TimetableEntry) => Promise<void>;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;

  addChatMessage: (message: ChatMessage) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  addActivity: (activity: Activity) => Promise<void>;

  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  getUserId: () => string | null;
  getSubjectById: (id: string) => Subject | undefined;
  getExamCountdown: (examId: string) => number;
  getTaskCompletionRate: () => number;
  getTotalStudyHours: (days: number) => number;
  getStreak: () => number;
  getCumulativeGPA: () => number;
  getSubjectGPA: (subjectId: string) => number;

  exportData: () => string;
  importData: (data: string) => Promise<boolean>;
  resetAllData: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  userId: '',
  theme: 'system',
  accentColor: 'orange',
  fontSize: 'medium',
  notifications: true,
  pomodoroWork: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
};

const mapDbToAppSettings = (dbSettings: any, userId: string): AppSettings => ({
  userId,
  theme: dbSettings?.theme || 'system',
  accentColor: dbSettings?.accent_color || 'orange',
  fontSize: dbSettings?.font_size || 'medium',
  notifications: dbSettings?.notifications ?? true,
  pomodoroWork: dbSettings?.pomodoro_work || 25,
  pomodoroShortBreak: dbSettings?.pomodoro_short_break || 5,
  pomodoroLongBreak: dbSettings?.pomodoro_long_break || 15,
});

export const useStore = create<AppState>()((set, get) => ({
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
  loading: false,
  initialized: false,
  userId: null,

  initialize: async (userId: string) => {
    set({ loading: true, userId });
    
    if (!isSupabaseConfigured()) {
      set({
        loading: false,
        initialized: true,
      });
      return;
    }
    
    try {
    const results = await Promise.allSettled([
      getSupabase().from('subjects').select('*').eq('user_id', userId),
      getSupabase().from('exams').select('*').eq('user_id', userId),
      getSupabase().from('study_sessions').select('*').eq('user_id', userId),
      getSupabase().from('tasks').select('*').eq('user_id', userId),
      getSupabase().from('pomodoro_sessions').select('*').eq('user_id', userId),
      getSupabase().from('grades').select('*').eq('user_id', userId),
      getSupabase().from('flashcard_decks').select('*').eq('user_id', userId),
      getSupabase().from('notes').select('*').eq('user_id', userId),
      getSupabase().from('habits').select('*').eq('user_id', userId),
      getSupabase().from('resources').select('*').eq('user_id', userId),
      getSupabase().from('goals').select('*').eq('user_id', userId),
      getSupabase().from('sleep_logs').select('*').eq('user_id', userId),
      getSupabase().from('timetable_entries').select('*').eq('user_id', userId),
      getSupabase().from('chat_history').select('*').eq('user_id', userId).order('timestamp', { ascending: true }),
      getSupabase().from('activities').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50),
      getSupabase().from('settings').select('*').eq('user_id', userId).single(),
    ]);

    const getData = (index: number) => {
      const result = results[index];
      return result.status === 'fulfilled' ? result.value.data : null;
    };

    const subjects = getData(0);
    const exams = getData(1);
    const studySessions = getData(2);
    const tasks = getData(3);
    const pomodoroSessions = getData(4);
    const grades = getData(5);
    const flashcardDecks = getData(6);
    const notes = getData(7);
    const habits = getData(8);
    const resources = getData(9);
    const goals = getData(10);
    const sleepLogs = getData(11);
    const timetable = getData(12);
    const chatHistory = getData(13);
    const activities = getData(14);
    const settings = getData(15);

    set({
      subjects: (subjects || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        name: s.name,
        color: s.color,
        icon: s.icon,
        teacher: s.teacher,
        credits: s.credits,
        room: s.room,
        createdAt: s.created_at,
      })),
      exams: (exams || []).map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        subjectId: e.subject_id,
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        syllabusTopics: e.syllabus_topics || [],
        priority: e.priority,
        status: e.status,
        studyMaterials: e.study_materials,
        reminderDays: e.reminder_days,
        difficulty: e.difficulty,
        createdAt: e.created_at,
      })),
      studySessions: (studySessions || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        subjectId: s.subject_id,
        title: s.title,
        date: s.date,
        duration: s.duration,
        notes: s.notes,
        completed: s.completed,
        createdAt: s.created_at,
      })),
      tasks: (tasks || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        title: t.title,
        dueDate: t.due_date,
        subjectId: t.subject_id,
        priority: t.priority,
        completed: t.completed,
        subtasks: t.subtasks || [],
        recurring: t.recurring,
        createdAt: t.created_at,
      })),
      pomodoroSessions: (pomodoroSessions || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        subjectId: p.subject_id,
        duration: p.duration,
        type: p.type,
        completedAt: p.completed_at,
      })),
      grades: (grades || []).map((g: any) => ({
        id: g.id,
        userId: g.user_id,
        subjectId: g.subject_id,
        title: g.title,
        score: g.score,
        maxMarks: g.max_marks,
        weightage: g.weightage,
        date: g.date,
        semester: g.semester,
        createdAt: g.created_at,
      })),
      flashcardDecks: (flashcardDecks || []).map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        subjectId: d.subject_id,
        title: d.title,
        description: d.description,
        cards: d.cards || [],
        createdAt: d.created_at,
      })),
      notes: (notes || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        subjectId: n.subject_id,
        title: n.title,
        content: n.content,
        tags: n.tags || [],
        pinned: n.pinned,
        archived: n.archived,
        wordCount: n.word_count,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })),
      habits: (habits || []).map((h: any) => ({
        id: h.id,
        userId: h.user_id,
        title: h.title,
        subjectId: h.subject_id,
        frequency: h.frequency,
        targetDays: h.target_days || [],
        completedDates: h.completed_dates || [],
        createdAt: h.created_at,
      })),
      resources: (resources || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        subjectId: r.subject_id,
        title: r.title,
        type: r.type,
        url: r.url,
        status: r.status,
        createdAt: r.created_at,
      })),
      goals: (goals || []).map((g: any) => ({
        id: g.id,
        userId: g.user_id,
        title: g.title,
        description: g.description,
        subjectId: g.subject_id,
        type: g.type,
        targetDate: g.target_date,
        milestones: g.milestones || [],
        achieved: g.achieved,
        createdAt: g.created_at,
      })),
      sleepLogs: (sleepLogs || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        date: s.date,
        hours: s.hours,
        energy: s.energy,
        createdAt: s.created_at,
      })),
      timetable: (timetable || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        subjectId: t.subject_id,
        dayOfWeek: t.day_of_week,
        startTime: t.start_time,
        endTime: t.end_time,
        room: t.room,
        teacher: t.teacher,
        createdAt: t.created_at,
      })),
      chatHistory: (chatHistory || []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        role: c.role,
        content: c.content,
        timestamp: c.timestamp,
      })),
      activities: (activities || []).map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        type: a.type,
        action: a.action,
        description: a.description,
        timestamp: a.timestamp,
      })),
      settings: settings ? mapDbToAppSettings(settings, userId) : { ...defaultSettings, userId },
      loading: false,
      initialized: true,
    });
    } catch (error) {
      console.error('Failed to load from Supabase:', error);
      set({
        loading: false,
        initialized: true,
      });
    }
  },

  addSubject: async (subject) => {
    const userId = get().userId || '';
    const subjectWithUserId = { ...subject, userId };
    const { error } = await getSupabase().from('subjects').insert({
      id: subject.id,
      user_id: userId,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      teacher: subject.teacher,
      credits: subject.credits,
      room: subject.room,
      created_at: subject.createdAt,
    });
    if (!error) {
      set((state) => ({ subjects: [...state.subjects, subjectWithUserId] }));
    }
  },

  updateSubject: async (id, subject) => {
    const updateData: any = {};
    if (subject.name !== undefined) updateData.name = subject.name;
    if (subject.color !== undefined) updateData.color = subject.color;
    if (subject.icon !== undefined) updateData.icon = subject.icon;
    if (subject.teacher !== undefined) updateData.teacher = subject.teacher;
    if (subject.credits !== undefined) updateData.credits = subject.credits;
    if (subject.room !== undefined) updateData.room = subject.room;

    const { error } = await getSupabase().from('subjects').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({
        subjects: state.subjects.map((s) => s.id === id ? { ...s, ...subject } : s)
      }));
    }
  },

  deleteSubject: async (id) => {
    const { error } = await getSupabase().from('subjects').delete().eq('id', id);
    if (!error) {
      set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
    }
  },

  addExam: async (exam) => {
    const { error } = await getSupabase().from('exams').insert({
      id: exam.id,
      user_id: get().userId,
      subject_id: exam.subjectId,
      title: exam.title,
      date: exam.date,
      time: exam.time,
      location: exam.location,
      syllabus_topics: exam.syllabusTopics,
      priority: exam.priority,
      status: exam.status,
      study_materials: exam.studyMaterials,
      reminder_days: exam.reminderDays,
      difficulty: exam.difficulty,
      created_at: exam.createdAt,
    });
    if (!error) {
      set((state) => ({ exams: [...state.exams, exam] }));
    }
  },

  updateExam: async (id, exam) => {
    const updateData: any = {};
    if (exam.subjectId !== undefined) updateData.subject_id = exam.subjectId;
    if (exam.title !== undefined) updateData.title = exam.title;
    if (exam.date !== undefined) updateData.date = exam.date;
    if (exam.time !== undefined) updateData.time = exam.time;
    if (exam.location !== undefined) updateData.location = exam.location;
    if (exam.syllabusTopics !== undefined) updateData.syllabus_topics = exam.syllabusTopics;
    if (exam.priority !== undefined) updateData.priority = exam.priority;
    if (exam.status !== undefined) updateData.status = exam.status;
    if (exam.studyMaterials !== undefined) updateData.study_materials = exam.studyMaterials;
    if (exam.reminderDays !== undefined) updateData.reminder_days = exam.reminderDays;
    if (exam.difficulty !== undefined) updateData.difficulty = exam.difficulty;

    const { error } = await getSupabase().from('exams').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ exams: state.exams.map((e) => e.id === id ? { ...e, ...exam } : e) }));
    }
  },

  deleteExam: async (id) => {
    const { error } = await getSupabase().from('exams').delete().eq('id', id);
    if (!error) {
      set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
    }
  },

  addStudySession: async (session) => {
    const { error } = await getSupabase().from('study_sessions').insert({
      id: session.id,
      user_id: get().userId,
      subject_id: session.subjectId,
      title: session.title,
      date: session.date,
      duration: session.duration,
      notes: session.notes,
      completed: session.completed,
      created_at: session.createdAt,
    });
    if (!error) {
      set((state) => ({ studySessions: [...state.studySessions, session] }));
    }
  },

  updateStudySession: async (id, session) => {
    const updateData: any = {};
    if (session.subjectId !== undefined) updateData.subject_id = session.subjectId;
    if (session.title !== undefined) updateData.title = session.title;
    if (session.date !== undefined) updateData.date = session.date;
    if (session.duration !== undefined) updateData.duration = session.duration;
    if (session.notes !== undefined) updateData.notes = session.notes;
    if (session.completed !== undefined) updateData.completed = session.completed;

    const { error } = await getSupabase().from('study_sessions').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ studySessions: state.studySessions.map((s) => s.id === id ? { ...s, ...session } : s) }));
    }
  },

  deleteStudySession: async (id) => {
    const { error } = await getSupabase().from('study_sessions').delete().eq('id', id);
    if (!error) {
      set((state) => ({ studySessions: state.studySessions.filter((s) => s.id !== id) }));
    }
  },

  addTask: async (task) => {
    const { error } = await getSupabase().from('tasks').insert({
      id: task.id,
      user_id: get().userId,
      title: task.title,
      due_date: task.dueDate,
      subject_id: task.subjectId,
      priority: task.priority,
      completed: task.completed,
      subtasks: task.subtasks,
      recurring: task.recurring,
      created_at: task.createdAt,
    });
    if (!error) {
      set((state) => ({ tasks: [...state.tasks, task] }));
    }
  },

  updateTask: async (id, task) => {
    const updateData: any = {};
    if (task.title !== undefined) updateData.title = task.title;
    if (task.dueDate !== undefined) updateData.due_date = task.dueDate;
    if (task.subjectId !== undefined) updateData.subject_id = task.subjectId;
    if (task.priority !== undefined) updateData.priority = task.priority;
    if (task.completed !== undefined) updateData.completed = task.completed;
    if (task.subtasks !== undefined) updateData.subtasks = task.subtasks;
    if (task.recurring !== undefined) updateData.recurring = task.recurring;

    const { error } = await getSupabase().from('tasks').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ tasks: state.tasks.map((t) => t.id === id ? { ...t, ...task } : t) }));
    }
  },

  deleteTask: async (id) => {
    const { error } = await getSupabase().from('tasks').delete().eq('id', id);
    if (!error) {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    }
  },

  addPomodoroSession: async (session) => {
    const { error } = await getSupabase().from('pomodoro_sessions').insert({
      id: session.id,
      user_id: get().userId,
      subject_id: session.subjectId,
      duration: session.duration,
      type: session.type,
      completed_at: session.completedAt,
    });
    if (!error) {
      set((state) => ({ pomodoroSessions: [...state.pomodoroSessions, session] }));
    }
  },

  addGrade: async (grade) => {
    const { error } = await getSupabase().from('grades').insert({
      id: grade.id,
      user_id: get().userId,
      subject_id: grade.subjectId,
      title: grade.title,
      score: grade.score,
      max_marks: grade.maxMarks,
      weightage: grade.weightage,
      date: grade.date,
      semester: grade.semester,
      created_at: grade.createdAt,
    });
    if (!error) {
      set((state) => ({ grades: [...state.grades, grade] }));
    }
  },

  updateGrade: async (id, grade) => {
    const updateData: any = {};
    if (grade.subjectId !== undefined) updateData.subject_id = grade.subjectId;
    if (grade.title !== undefined) updateData.title = grade.title;
    if (grade.score !== undefined) updateData.score = grade.score;
    if (grade.maxMarks !== undefined) updateData.max_marks = grade.maxMarks;
    if (grade.weightage !== undefined) updateData.weightage = grade.weightage;
    if (grade.date !== undefined) updateData.date = grade.date;
    if (grade.semester !== undefined) updateData.semester = grade.semester;

    const { error } = await getSupabase().from('grades').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ grades: state.grades.map((g) => g.id === id ? { ...g, ...grade } : g) }));
    }
  },

  deleteGrade: async (id) => {
    const { error } = await getSupabase().from('grades').delete().eq('id', id);
    if (!error) {
      set((state) => ({ grades: state.grades.filter((g) => g.id !== id) }));
    }
  },

  addFlashcardDeck: async (deck) => {
    const { error } = await getSupabase().from('flashcard_decks').insert({
      id: deck.id,
      user_id: get().userId,
      subject_id: deck.subjectId,
      title: deck.title,
      description: deck.description,
      cards: deck.cards,
      created_at: deck.createdAt,
    });
    if (!error) {
      set((state) => ({ flashcardDecks: [...state.flashcardDecks, deck] }));
    }
  },

  updateFlashcardDeck: async (id, deck) => {
    const updateData: any = {};
    if (deck.subjectId !== undefined) updateData.subject_id = deck.subjectId;
    if (deck.title !== undefined) updateData.title = deck.title;
    if (deck.description !== undefined) updateData.description = deck.description;
    if (deck.cards !== undefined) updateData.cards = deck.cards;

    const { error } = await getSupabase().from('flashcard_decks').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ flashcardDecks: state.flashcardDecks.map((d) => d.id === id ? { ...d, ...deck } : d) }));
    }
  },

  deleteFlashcardDeck: async (id) => {
    const { error } = await getSupabase().from('flashcard_decks').delete().eq('id', id);
    if (!error) {
      set((state) => ({ flashcardDecks: state.flashcardDecks.filter((d) => d.id !== id) }));
    }
  },

  addNote: async (note) => {
    const { error } = await getSupabase().from('notes').insert({
      id: note.id,
      user_id: get().userId,
      subject_id: note.subjectId,
      title: note.title,
      content: note.content,
      tags: note.tags,
      pinned: note.pinned,
      archived: note.archived,
      word_count: note.wordCount,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });
    if (!error) {
      set((state) => ({ notes: [...state.notes, note] }));
    }
  },

  updateNote: async (id, note) => {
    const updateData: any = {};
    if (note.subjectId !== undefined) updateData.subject_id = note.subjectId;
    if (note.title !== undefined) updateData.title = note.title;
    if (note.content !== undefined) updateData.content = note.content;
    if (note.tags !== undefined) updateData.tags = note.tags;
    if (note.pinned !== undefined) updateData.pinned = note.pinned;
    if (note.archived !== undefined) updateData.archived = note.archived;
    if (note.wordCount !== undefined) updateData.word_count = note.wordCount;
    if (note.updatedAt !== undefined) updateData.updated_at = note.updatedAt;

    const { error } = await getSupabase().from('notes').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ notes: state.notes.map((n) => n.id === id ? { ...n, ...note } : n) }));
    }
  },

  deleteNote: async (id) => {
    const { error } = await getSupabase().from('notes').delete().eq('id', id);
    if (!error) {
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    }
  },

  addHabit: async (habit) => {
    const { error } = await getSupabase().from('habits').insert({
      id: habit.id,
      user_id: get().userId,
      title: habit.title,
      subject_id: habit.subjectId,
      frequency: habit.frequency,
      target_days: habit.targetDays,
      completed_dates: habit.completedDates,
      created_at: habit.createdAt,
    });
    if (!error) {
      set((state) => ({ habits: [...state.habits, habit] }));
    }
  },

  updateHabit: async (id, habit) => {
    const updateData: any = {};
    if (habit.title !== undefined) updateData.title = habit.title;
    if (habit.subjectId !== undefined) updateData.subject_id = habit.subjectId;
    if (habit.frequency !== undefined) updateData.frequency = habit.frequency;
    if (habit.targetDays !== undefined) updateData.target_days = habit.targetDays;
    if (habit.completedDates !== undefined) updateData.completed_dates = habit.completedDates;

    const { error } = await getSupabase().from('habits').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ habits: state.habits.map((h) => h.id === id ? { ...h, ...habit } : h) }));
    }
  },

  deleteHabit: async (id) => {
    const { error } = await getSupabase().from('habits').delete().eq('id', id);
    if (!error) {
      set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
    }
  },

  addResource: async (resource) => {
    const { error } = await getSupabase().from('resources').insert({
      id: resource.id,
      user_id: get().userId,
      subject_id: resource.subjectId,
      title: resource.title,
      type: resource.type,
      url: resource.url,
      status: resource.status,
      created_at: resource.createdAt,
    });
    if (!error) {
      set((state) => ({ resources: [...state.resources, resource] }));
    }
  },

  updateResource: async (id, resource) => {
    const updateData: any = {};
    if (resource.subjectId !== undefined) updateData.subject_id = resource.subjectId;
    if (resource.title !== undefined) updateData.title = resource.title;
    if (resource.type !== undefined) updateData.type = resource.type;
    if (resource.url !== undefined) updateData.url = resource.url;
    if (resource.status !== undefined) updateData.status = resource.status;

    const { error } = await getSupabase().from('resources').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ resources: state.resources.map((r) => r.id === id ? { ...r, ...resource } : r) }));
    }
  },

  deleteResource: async (id) => {
    const { error } = await getSupabase().from('resources').delete().eq('id', id);
    if (!error) {
      set((state) => ({ resources: state.resources.filter((r) => r.id !== id) }));
    }
  },

  addGoal: async (goal) => {
    const { error } = await getSupabase().from('goals').insert({
      id: goal.id,
      user_id: get().userId,
      title: goal.title,
      description: goal.description,
      subject_id: goal.subjectId,
      type: goal.type,
      target_date: goal.targetDate,
      milestones: goal.milestones,
      achieved: goal.achieved,
      created_at: goal.createdAt,
    });
    if (!error) {
      set((state) => ({ goals: [...state.goals, goal] }));
    }
  },

  updateGoal: async (id, goal) => {
    const updateData: any = {};
    if (goal.title !== undefined) updateData.title = goal.title;
    if (goal.description !== undefined) updateData.description = goal.description;
    if (goal.subjectId !== undefined) updateData.subject_id = goal.subjectId;
    if (goal.type !== undefined) updateData.type = goal.type;
    if (goal.targetDate !== undefined) updateData.target_date = goal.targetDate;
    if (goal.milestones !== undefined) updateData.milestones = goal.milestones;
    if (goal.achieved !== undefined) updateData.achieved = goal.achieved;

    const { error } = await getSupabase().from('goals').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ goals: state.goals.map((g) => g.id === id ? { ...g, ...goal } : g) }));
    }
  },

  deleteGoal: async (id) => {
    const { error } = await getSupabase().from('goals').delete().eq('id', id);
    if (!error) {
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    }
  },

  addSleepLog: async (log) => {
    const { error } = await getSupabase().from('sleep_logs').insert({
      id: log.id,
      user_id: get().userId,
      date: log.date,
      hours: log.hours,
      energy: log.energy,
      created_at: log.createdAt,
    });
    if (!error) {
      set((state) => ({ sleepLogs: [...state.sleepLogs, log] }));
    }
  },

  updateSleepLog: async (id, log) => {
    const updateData: any = {};
    if (log.date !== undefined) updateData.date = log.date;
    if (log.hours !== undefined) updateData.hours = log.hours;
    if (log.energy !== undefined) updateData.energy = log.energy;

    const { error } = await getSupabase().from('sleep_logs').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ sleepLogs: state.sleepLogs.map((s) => s.id === id ? { ...s, ...log } : s) }));
    }
  },

  addTimetableEntry: async (entry) => {
    const { error } = await getSupabase().from('timetable_entries').insert({
      id: entry.id,
      user_id: get().userId,
      subject_id: entry.subjectId,
      day_of_week: entry.dayOfWeek,
      start_time: entry.startTime,
      end_time: entry.endTime,
      room: entry.room,
      teacher: entry.teacher,
      created_at: entry.createdAt,
    });
    if (!error) {
      set((state) => ({ timetable: [...state.timetable, entry] }));
    }
  },

  updateTimetableEntry: async (id, entry) => {
    const updateData: any = {};
    if (entry.subjectId !== undefined) updateData.subject_id = entry.subjectId;
    if (entry.dayOfWeek !== undefined) updateData.day_of_week = entry.dayOfWeek;
    if (entry.startTime !== undefined) updateData.start_time = entry.startTime;
    if (entry.endTime !== undefined) updateData.end_time = entry.endTime;
    if (entry.room !== undefined) updateData.room = entry.room;
    if (entry.teacher !== undefined) updateData.teacher = entry.teacher;

    const { error } = await getSupabase().from('timetable_entries').update(updateData).eq('id', id);
    if (!error) {
      set((state) => ({ timetable: state.timetable.map((t) => t.id === id ? { ...t, ...entry } : t) }));
    }
  },

  deleteTimetableEntry: async (id) => {
    const { error } = await getSupabase().from('timetable_entries').delete().eq('id', id);
    if (!error) {
      set((state) => ({ timetable: state.timetable.filter((t) => t.id !== id) }));
    }
  },

  addChatMessage: async (message) => {
    const { error } = await getSupabase().from('chat_history').insert({
      id: message.id,
      user_id: get().userId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    });
    if (!error) {
      set((state) => ({ chatHistory: [...state.chatHistory, message] }));
    }
  },

  clearChatHistory: async () => {
    const { error } = await getSupabase().from('chat_history').delete().neq('id', '');
    if (!error) {
      set({ chatHistory: [] });
    }
  },

  addActivity: async (activity) => {
    const { error } = await getSupabase().from('activities').insert({
      id: activity.id,
      user_id: get().userId,
      type: activity.type,
      action: activity.action,
      description: activity.description,
      timestamp: activity.timestamp,
    });
    if (!error) {
      set((state) => ({
        activities: [activity, ...state.activities].slice(0, 50)
      }));
    }
  },

  updateSettings: async (newSettings) => {
    const { settings, userId } = get();
    const updatedSettings = { ...settings, ...newSettings };
    
    if (!userId) return;
    
    const updateData: any = {
      theme: updatedSettings.theme,
      accent_color: updatedSettings.accentColor,
      font_size: updatedSettings.fontSize,
      notifications: updatedSettings.notifications,
      pomodoro_work: updatedSettings.pomodoroWork,
      pomodoro_short_break: updatedSettings.pomodoroShortBreak,
      pomodoro_long_break: updatedSettings.pomodoroLongBreak,
      updated_at: new Date().toISOString(),
    };

    const { error } = await getSupabase().from('settings').update(updateData).eq('user_id', userId);
    if (!error) {
      set({ settings: updatedSettings });
    }
  },

  getUserId: () => get().userId,

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
    const { activities } = get();
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

  importData: async (data) => {
    try {
      const parsed = JSON.parse(data);
      const userId = get().userId;
      
      if (!userId) return false;

      const tables = [
        { name: 'subjects', data: parsed.subjects || [] },
        { name: 'exams', data: parsed.exams || [] },
        { name: 'study_sessions', data: parsed.studySessions || [] },
        { name: 'tasks', data: parsed.tasks || [] },
        { name: 'pomodoro_sessions', data: parsed.pomodoroSessions || [] },
        { name: 'grades', data: parsed.grades || [] },
        { name: 'flashcard_decks', data: parsed.flashcardDecks || [] },
        { name: 'notes', data: parsed.notes || [] },
        { name: 'habits', data: parsed.habits || [] },
        { name: 'resources', data: parsed.resources || [] },
        { name: 'goals', data: parsed.goals || [] },
        { name: 'sleep_logs', data: parsed.sleepLogs || [] },
        { name: 'timetable_entries', data: parsed.timetable || [] },
      ];

      for (const table of tables) {
        if (table.data.length > 0) {
          await getSupabase().from(table.name).delete().eq('user_id', userId);
          
          const insertData = table.data.map((item: any) => ({
            ...item,
            user_id: userId,
          }));
          
          await getSupabase().from(table.name).insert(insertData);
        }
      }

      await get().initialize(userId);
      return true;
    } catch {
      return false;
    }
  },

  resetAllData: async () => {
    const userId = get().userId;
    if (!userId) return;

    const tables = [
      'subjects', 'exams', 'study_sessions', 'tasks', 'pomodoro_sessions',
      'grades', 'flashcard_decks', 'notes', 'habits', 'resources',
      'goals', 'sleep_logs', 'timetable_entries', 'chat_history', 'activities'
    ];

    for (const table of tables) {
      await getSupabase().from(table).delete().eq('user_id', userId);
    }

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
}));

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
