import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. App will run in demo mode.');
}

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
};

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseAnonKey;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          teacher: string | null;
          credits: number | null;
          room: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          teacher?: string | null;
          credits?: number | null;
          room?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string;
          teacher?: string | null;
          credits?: number | null;
          room?: string | null;
          created_at?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          date: string;
          time: string | null;
          location: string | null;
          syllabus_topics: string[];
          priority: string;
          status: string;
          study_materials: string | null;
          reminder_days: number;
          difficulty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          title: string;
          date: string;
          time?: string | null;
          location?: string | null;
          syllabus_topics?: string[];
          priority: string;
          status: string;
          study_materials?: string | null;
          reminder_days?: number;
          difficulty?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string | null;
          title?: string;
          date?: string;
          time?: string | null;
          location?: string | null;
          syllabus_topics?: string[];
          priority?: string;
          status?: string;
          study_materials?: string | null;
          reminder_days?: number;
          difficulty?: number;
          created_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          date: string;
          duration: number;
          notes: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          title: string;
          date: string;
          duration: number;
          notes?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string | null;
          title?: string;
          date?: string;
          duration?: number;
          notes?: string | null;
          completed?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          due_date: string | null;
          subject_id: string | null;
          priority: string;
          completed: boolean;
          subtasks: any[];
          recurring: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          due_date?: string | null;
          subject_id?: string | null;
          priority: string;
          completed?: boolean;
          subtasks?: any[];
          recurring?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          due_date?: string | null;
          subject_id?: string | null;
          priority?: string;
          completed?: boolean;
          subtasks?: any[];
          recurring?: string | null;
          created_at?: string;
        };
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          duration: number;
          type: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          duration: number;
          type: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string | null;
          duration?: number;
          type?: string;
          completed_at?: string;
        };
      };
      grades: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          title: string;
          score: number;
          max_marks: number;
          weightage: number;
          date: string;
          semester: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          title: string;
          score: number;
          max_marks: number;
          weightage: number;
          date: string;
          semester?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          title?: string;
          score?: number;
          max_marks?: number;
          weightage?: number;
          date?: string;
          semester?: string | null;
          created_at?: string;
        };
      };
      flashcard_decks: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          title: string;
          description: string | null;
          cards: any[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          title: string;
          description?: string | null;
          cards?: any[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          title?: string;
          description?: string | null;
          cards?: any[];
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          content: string;
          tags: string[];
          pinned: boolean;
          archived: boolean;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          title: string;
          content: string;
          tags?: string[];
          pinned?: boolean;
          archived?: boolean;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string | null;
          title?: string;
          content?: string;
          tags?: string[];
          pinned?: boolean;
          archived?: boolean;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject_id: string | null;
          frequency: string;
          target_days: number[];
          completed_dates: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subject_id?: string | null;
          frequency: string;
          target_days?: number[];
          completed_dates?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subject_id?: string | null;
          frequency?: string;
          target_days?: number[];
          completed_dates?: string[];
          created_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          title: string;
          type: string;
          url: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          title: string;
          type: string;
          url?: string | null;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          title?: string;
          type?: string;
          url?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          subject_id: string | null;
          type: string;
          target_date: string;
          milestones: any[];
          achieved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          subject_id?: string | null;
          type: string;
          target_date: string;
          milestones?: any[];
          achieved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          subject_id?: string | null;
          type?: string;
          target_date?: string;
          milestones?: any[];
          achieved?: boolean;
          created_at?: string;
        };
      };
      sleep_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          hours: number;
          energy: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          hours: number;
          energy: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          hours?: number;
          energy?: number;
          created_at?: string;
        };
      };
      timetable_entries: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room: string | null;
          teacher: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room?: string | null;
          teacher?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          room?: string | null;
          teacher?: string | null;
          created_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          content: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          content: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          content?: string;
          timestamp?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          action: string;
          description: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          action: string;
          description: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          action?: string;
          description?: string;
          timestamp?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          accent_color: string;
          font_size: string;
          notifications: boolean;
          pomodoro_work: number;
          pomodoro_short_break: number;
          pomodoro_long_break: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          accent_color?: string;
          font_size?: string;
          notifications?: boolean;
          pomodoro_work?: number;
          pomodoro_short_break?: number;
          pomodoro_long_break?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          accent_color?: string;
          font_size?: string;
          notifications?: boolean;
          pomodoro_work?: number;
          pomodoro_short_break?: number;
          pomodoro_long_break?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
