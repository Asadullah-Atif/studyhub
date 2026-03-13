'use client';

import { useEffect, useState } from 'react';
import {
  GraduationCap, ListTodo, Flame, Timer, TrendingUp,
  Calendar, Quote, ChevronRight, Clock, BookOpen,
  Brain
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Card, Badge, ProgressBar } from '../components/ui';
import { formatDate, getDaysUntil, formatRelativeDate, cn, getStreakBadge } from '../lib/utils';
import { QUOTES } from '../lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { subjects, exams, tasks, pomodoroSessions, activities, getStreak, getTotalStudyHours, getTaskCompletionRate, getCumulativeGPA } = useStore();
  
  const [quote, setQuote] = useState(QUOTES[0]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const today = new Date();
    const index = (today.getFullYear() * 365 + today.getMonth() * 30 + today.getDate()) % QUOTES.length;
    setQuote(QUOTES[index]);
  }, []);

  const upcomingExams = exams
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return 0;
    })
    .slice(0, 5);

  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate === today && !t.completed;
  });

  const todaySessions = pomodoroSessions.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.completedAt.startsWith(today) && s.type === 'study';
  });

  const todayFocusTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const streak = getStreak();
  const streakBadge = getStreakBadge(streak);
  const weekStudyHours = getTotalStudyHours(7);
  const taskCompletionRate = getTaskCompletionRate();
  const gpa = getCumulativeGPA();

  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getExamCountdown = (date: string) => {
    const days = getDaysUntil(date);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getSubjectName = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    return subject?.name || 'Unknown';
  };

  const getSubjectColor = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    return subject?.color || '#6B7280';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s your study overview for today
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Exams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {upcomingExams.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {pendingTasks.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Study Streak</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak} {streakBadge.emoji}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <Timer className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Focus Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {todayFocusTime} min
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overall GPA</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {gpa.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Schedule
              </h2>
              <Link href="/timetable" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-2">
              {weekDates.map((date, i) => {
                const dateStr = date.toISOString().split('T')[0];
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayExams = exams.filter(e => e.date === dateStr);
                const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
                
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 p-3 rounded-lg text-center transition-all',
                      isToday ? 'bg-[var(--accent)] text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800'
                    )}
                  >
                    <p className={cn('text-xs font-medium', isToday ? 'text-white/80' : 'text-gray-500 dark:text-gray-400')}>
                      {weekDays[i]}
                    </p>
                    <p className={cn('text-lg font-bold', isToday ? 'text-white' : 'text-gray-900 dark:text-white')}>
                      {date.getDate()}
                    </p>
                    <div className="mt-2 space-y-1">
                      {dayExams.length > 0 && (
                        <div className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          isToday ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        )}>
                          {dayExams.length} exam{dayExams.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {dayTasks.length > 0 && (
                        <div className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          isToday ? 'bg-white/20 text-white' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        )}>
                          {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Exams
                </h2>
                <Link href="/exams" className="text-sm text-[var(--accent)] hover:underline">
                  View all
                </Link>
              </div>
              {upcomingExams.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming exams
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingExams.map(exam => (
                    <div
                      key={exam.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div
                        className="w-2 h-12 rounded-full"
                        style={{ backgroundColor: getSubjectColor(exam.subjectId) }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {exam.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getSubjectName(exam.subjectId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'font-semibold',
                          getDaysUntil(exam.date) <= 3 ? 'text-red-500' : 'text-gray-900 dark:text-white'
                        )}>
                          {getExamCountdown(exam.date)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(exam.date, 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Today&apos;s Tasks
                </h2>
                <Link href="/tasks" className="text-sm text-[var(--accent)] hover:underline">
                  View all
                </Link>
              </div>
              {todayTasks.length === 0 && pendingTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No tasks for today
                </p>
              ) : (
                <div className="space-y-3">
                  {[...todayTasks, ...pendingTasks].slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className={cn(
                        'w-2 h-10 rounded-full',
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      )} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                      {task.priority === 'high' && (
                        <Badge variant="danger">High</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 text-white">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 opacity-80 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg font-medium italic">&quot;{quote.text}&quot;</p>
                <p className="text-sm opacity-80 mt-2">— {quote.author}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Progress
              </h2>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {taskCompletionRate}%
              </span>
            </div>
            <ProgressBar value={taskCompletionRate} className="mb-4" />
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.completed).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingTasks.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            {activities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      activity.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                      activity.type === 'exam' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                      activity.type === 'session' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                    )}>
                      {activity.type === 'task' ? <ListTodo className="w-4 h-4" /> :
                       activity.type === 'exam' ? <GraduationCap className="w-4 h-4" /> :
                       activity.type === 'session' ? <Timer className="w-4 h-4" /> :
                       activity.type === 'grade' ? <TrendingUp className="w-4 h-4" /> :
                       <Brain className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Stats
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">This week</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {weekStudyHours} hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Subjects</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {subjects.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">Grades</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {tasks.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
