-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Settings table
create table settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  theme text default 'system',
  accent_color text default 'orange',
  font_size text default 'medium',
  notifications boolean default true,
  pomodoro_work integer default 25,
  pomodoro_short_break integer default 5,
  pomodoro_long_break integer default 15,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subjects table
create table subjects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null,
  icon text not null,
  teacher text,
  credits integer,
  room text,
  created_at timestamptz default now()
);

-- Exams table
create table exams (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  date text not null,
  time text,
  location text,
  syllabus_topics text[] default '{}',
  priority text default 'medium',
  status text default 'upcoming',
  study_materials text,
  reminder_days integer default 7,
  difficulty integer default 3,
  created_at timestamptz default now()
);

-- Study sessions table
create table study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  date text not null,
  duration integer not null,
  notes text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  due_date text,
  subject_id uuid references subjects(id) on delete set null,
  priority text default 'medium',
  completed boolean default false,
  subtasks jsonb default '[]',
  recurring text,
  created_at timestamptz default now()
);

-- Pomodoro sessions table
create table pomodoro_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete set null,
  duration integer not null,
  type text not null,
  completed_at timestamptz default now()
);

-- Grades table
create table grades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  title text not null,
  score numeric not null,
  max_marks numeric not null,
  weightage numeric default 1,
  date text not null,
  semester text,
  created_at timestamptz default now()
);

-- Flashcard decks table
create table flashcard_decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  title text not null,
  description text,
  cards jsonb default '[]',
  created_at timestamptz default now()
);

-- Notes table
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  pinned boolean default false,
  archived boolean default false,
  word_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habits table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  subject_id uuid references subjects(id) on delete set null,
  frequency text not null,
  target_days integer[] default '{0,1,2,3,4,5,6}',
  completed_dates text[] default '{}',
  created_at timestamptz default now()
);

-- Resources table
create table resources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  title text not null,
  type text not null,
  url text,
  status text default 'to-read',
  created_at timestamptz default now()
);

-- Goals table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  subject_id uuid references subjects(id) on delete set null,
  type text not null,
  target_date text not null,
  milestones jsonb default '[]',
  achieved boolean default false,
  created_at timestamptz default now()
);

-- Sleep logs table
create table sleep_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  hours numeric not null,
  energy integer default 5,
  created_at timestamptz default now()
);

-- Timetable entries table
create table timetable_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  day_of_week integer not null,
  start_time text not null,
  end_time text not null,
  room text,
  teacher text,
  created_at timestamptz default now()
);

-- Chat history table
create table chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null,
  content text not null,
  timestamp timestamptz default now()
);

-- Activities table
create table activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  action text not null,
  description text not null,
  timestamp timestamptz default now()
);

-- Create indexes for better query performance
create index idx_subjects_user on subjects(user_id);
create index idx_exams_user on exams(user_id);
create index idx_study_sessions_user on study_sessions(user_id);
create index idx_tasks_user on tasks(user_id);
create index idx_pomodoro_sessions_user on pomodoro_sessions(user_id);
create index idx_grades_user on grades(user_id);
create index idx_flashcard_decks_user on flashcard_decks(user_id);
create index idx_notes_user on notes(user_id);
create index idx_habits_user on habits(user_id);
create index idx_resources_user on resources(user_id);
create index idx_goals_user on goals(user_id);
create index idx_sleep_logs_user on sleep_logs(user_id);
create index idx_timetable_entries_user on timetable_entries(user_id);
create index idx_chat_history_user on chat_history(user_id);
create index idx_activities_user on activities(user_id);

-- Row Level Security (RLS) - enable security
alter table profiles enable row level security;
alter table settings enable row level security;
alter table subjects enable row level security;
alter table exams enable row level security;
alter table study_sessions enable row level security;
alter table tasks enable row level security;
alter table pomodoro_sessions enable row level security;
alter table grades enable row level security;
alter table flashcard_decks enable row level security;
alter table notes enable row level security;
alter table habits enable row level security;
alter table resources enable row level security;
alter table goals enable row level security;
alter table sleep_logs enable row level security;
alter table timetable_entries enable row level security;
alter table chat_history enable row level security;
alter table activities enable row level security;

-- RLS Policies - users can only see their own data
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own settings" on settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on settings for update using (auth.uid() = user_id);

create policy "Users can CRUD own subjects" on subjects for all using (auth.uid() = user_id);
create policy "Users can CRUD own exams" on exams for all using (auth.uid() = user_id);
create policy "Users can CRUD own study_sessions" on study_sessions for all using (auth.uid() = user_id);
create policy "Users can CRUD own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can CRUD own pomodoro_sessions" on pomodoro_sessions for all using (auth.uid() = user_id);
create policy "Users can CRUD own grades" on grades for all using (auth.uid() = user_id);
create policy "Users can CRUD own flashcard_decks" on flashcard_decks for all using (auth.uid() = user_id);
create policy "Users can CRUD own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can CRUD own habits" on habits for all using (auth.uid() = user_id);
create policy "Users can CRUD own resources" on resources for all using (auth.uid() = user_id);
create policy "Users can CRUD own goals" on goals for all using (auth.uid() = user_id);
create policy "Users can CRUD own sleep_logs" on sleep_logs for all using (auth.uid() = user_id);
create policy "Users can CRUD own timetable_entries" on timetable_entries for all using (auth.uid() = user_id);
create policy "Users can CRUD own chat_history" on chat_history for all using (auth.uid() = user_id);
create policy "Users can CRUD own activities" on activities for all using (auth.uid() = user_id);

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  insert into public.settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
