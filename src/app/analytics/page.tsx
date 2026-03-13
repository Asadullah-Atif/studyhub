'use client';

import { useMemo } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Clock, Target, Brain,
  CheckCircle, Calendar, Flame
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { getLetterGrade } from '../../lib/store';
import { Card, Badge, ProgressBar } from '../../components/ui';
import { formatDate, getStreakBadge, cn } from '../../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export default function AnalyticsPage() {
  const {
    subjects, exams, tasks, pomodoroSessions, grades, flashcardDecks,
    getTotalStudyHours, getStreak, getCumulativeGPA, getSubjectGPA
  } = useStore();

  const weekStudyHours = getTotalStudyHours(7);
  const monthStudyHours = getTotalStudyHours(30);
  const streak = getStreak();
  const streakBadge = getStreakBadge(streak);
  const gpa = getCumulativeGPA();

  const subjectTimeData = useMemo(() => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);

    const timeBySubject: Record<string, number> = {};
    
    pomodoroSessions
      .filter(s => new Date(s.completedAt) >= monthAgo && s.type === 'study')
      .forEach(s => {
        if (!s.subjectId) return;
        timeBySubject[s.subjectId] = (timeBySubject[s.subjectId] || 0) + s.duration;
      });

    return Object.entries(timeBySubject)
      .map(([subjectId, minutes]) => {
        const subject = subjects.find(s => s.id === subjectId);
        return {
          name: subject?.name || 'Unknown',
          value: Math.round(minutes / 60 * 10) / 10,
          color: subject?.color || '#6B7280',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [pomodoroSessions, subjects]);

  const weeklyActivityData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const sessions = pomodoroSessions.filter(
        s => s.completedAt.startsWith(dateStr) && s.type === 'study'
      );
      const minutes = sessions.reduce((sum, s) => sum + s.duration, 0);

      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round(minutes / 60 * 10) / 10,
      });
    }

    return data;
  }, [pomodoroSessions]);

  const gradeTrendData = useMemo(() => {
    return [...grades]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map(g => ({
        date: formatDate(g.date, 'MM/dd'),
        percentage: Math.round((g.score / g.maxMarks) * 100),
        subject: subjects.find(s => s.id === g.subjectId)?.name || 'Unknown',
      }));
  }, [grades, subjects]);

  const taskCompletionData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const completed = tasks.filter(
        t => t.completed && t.createdAt.startsWith(dateStr)
      ).length;
      const total = tasks.filter(t => t.createdAt.startsWith(dateStr)).length;

      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        total,
      });
    }

    return data;
  }, [tasks]);

  const flashcardMastery = useMemo(() => {
    return flashcardDecks.map(deck => {
      const total = deck.cards.length;
      const known = deck.cards.filter(c => c.status === 'known').length;
      const mastery = total > 0 ? Math.round((known / total) * 100) : 0;
      
      return {
        name: deck.title,
        mastery,
        known,
        total,
      };
    });
  }, [flashcardDecks]);

  const mostProductiveDay = useMemo(() => {
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    pomodoroSessions
      .filter(s => new Date(s.completedAt) >= weekAgo && s.type === 'study')
      .forEach(s => {
        const day = new Date(s.completedAt).getDay();
        dayTotals[day] += s.duration;
      });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxIndex = dayTotals.indexOf(Math.max(...dayTotals));
    
    return days[maxIndex];
  }, [pomodoroSessions]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics & Insights
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your study performance and progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weekStudyHours} hrs
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthStudyHours} hrs
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {streak} {streakBadge.emoji}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">GPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {gpa.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Study Hours
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Subject Time Distribution
          </h3>
          {subjectTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={subjectTimeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No study data yet</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Grade Trend
          </h3>
          {gradeTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gradeTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="var(--accent)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No grade data yet</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Task Completion
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Overall Completion Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
            </div>
            <ProgressBar value={completionRate} />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalTasks - completedTasks}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Flashcard Mastery
          </h3>
          {flashcardMastery.length > 0 ? (
            <div className="space-y-3">
              {flashcardMastery.map((deck, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {deck.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {deck.mastery}%
                    </span>
                  </div>
                  <ProgressBar value={deck.mastery} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No flashcard data</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Brain className="w-4 h-4" />
                Most Productive Day
              </span>
              <Badge variant="success">{mostProductiveDay}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Target className="w-4 h-4" />
                Total Subjects
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{subjects.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4" />
                Tasks Completed
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BarChart3 className="w-4 h-4" />
                Assessments
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{grades.length}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Subject Performance
          </h3>
          <div className="space-y-3">
            {subjects.slice(0, 5).map(subject => {
              const subjectGPA = getSubjectGPA(subject.id);
              const subjectGrades = grades.filter(g => g.subjectId === subject.id);
              
              return (
                <div key={subject.id} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {subject.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {subjectGrades.length > 0 ? subjectGPA.toFixed(2) : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
