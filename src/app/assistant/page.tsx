'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, User, Sparkles, Trash2, GraduationCap, ListTodo,
  Clock, TrendingUp, Target, AlertCircle, BookOpen
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input } from '../../components/ui';
import { generateId, cn, getDaysUntil, formatDate, getStreakBadge } from '../../lib/utils';
import { ChatMessage } from '../../lib/types';

export default function AssistantPage() {
  const {
    subjects, exams, tasks, grades, pomodoroSessions, habits,
    chatHistory, addChatMessage, clearChatHistory,
    getCumulativeGPA, getSubjectGPA, getTotalStudyHours, getStreak, getTaskCompletionRate
  } = useStore();
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('what should i study') || input.includes('suggest') || input.includes('recommend')) {
      const upcomingExams = exams.filter(e => e.status === 'upcoming');
      if (upcomingExams.length > 0) {
        const sorted = upcomingExams.sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
        const nearest = sorted[0];
        const subject = subjects.find(s => s.id === nearest.subjectId);
        return `Based on your upcoming exams, I recommend studying **${subject?.name || 'your exam'}** first. "${nearest.title}" is in ${getDaysUntil(nearest.date)} days. Check the syllabus topics: ${nearest.syllabusTopics.slice(0, 3).join(', ')}`;
      }
      
      const pendingTasks = tasks.filter(t => !t.completed);
      if (pendingTasks.length > 0) {
        const highPriority = pendingTasks.filter(t => t.priority === 'high');
        if (highPriority.length > 0) {
          return `You have ${pendingTasks.length} pending tasks. Start with: **${highPriority[0].title}** (High priority)`;
        }
        return `You have ${pendingTasks.length} pending tasks. Start with: **${pendingTasks[0].title}**`;
      }
      
      return 'No urgent tasks or exams! Consider reviewing flashcards or working on your goals.';
    }
    
    if (input.includes('exam') && (input.includes('when') || input.includes('how many days') || input.includes('until'))) {
      const upcomingExams = exams.filter(e => e.status === 'upcoming');
      if (upcomingExams.length === 0) {
        return "You have no upcoming exams!";
      }
      
      const sorted = upcomingExams.sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
      const nearest = sorted[0];
      const subject = subjects.find(s => s.id === nearest.subjectId);
      
      if (sorted.length === 1) {
        return `Your next exam is **${nearest.title}** (${subject?.name}) in **${getDaysUntil(nearest.date)} days** on ${formatDate(nearest.date)}`;
      }
      
      const responses = sorted.slice(0, 3).map((e, i) => {
        const subj = subjects.find(s => s.id === e.subjectId);
        return `${i + 1}. ${e.title} (${subj?.name}) - ${getDaysUntil(e.date)} days`;
      }).join('\n');
      
      return `Here are your upcoming exams:\n${responses}`;
    }
    
    if (input.includes('weak') || input.includes('worst') || input.includes('lowest')) {
      const subjectGPAs = subjects.map(s => ({
        subject: s.name,
        gpa: getSubjectGPA(s.id),
        grades: grades.filter(g => g.subjectId === s.id).length
      })).filter(s => s.grades > 0).sort((a, b) => a.gpa - b.gpa);
      
      if (subjectGPAs.length === 0) {
        return "You haven't logged any grades yet!";
      }
      
      const weakest = subjectGPAs[0];
      return `Your lowest performing subject is **${weakest.subject}** with a GPA of ${weakest.gpa.toFixed(2)}. Consider spending more study time on this subject!`;
    }
    
    if (input.includes('gpa') || input.includes('grade') || input.includes('performance')) {
      const gpa = getCumulativeGPA();
      const totalGrades = grades.length;
      
      if (totalGrades === 0) {
        return "You haven't logged any grades yet!";
      }
      
      const avgGrade = grades.reduce((sum, g) => sum + (g.score / g.maxMarks) * 100, 0) / totalGrades;
      
      return `Your cumulative GPA is **${gpa.toFixed(2)}** based on ${totalGrades} assessments. Your average grade is ${avgGrade.toFixed(1)}%.`;
    }
    
    if (input.includes('task') || input.includes('todo')) {
      const pending = tasks.filter(t => !t.completed);
      const highPriority = pending.filter(t => t.priority === 'high');
      
      if (pending.length === 0) {
        return "All tasks completed! Great job! 🎉";
      }
      
      let response = `You have **${pending.length}** pending task${pending.length > 1 ? 's' : ''}.`;
      if (highPriority.length > 0) {
        response += `\n\n**High Priority:**\n${highPriority.slice(0, 3).map(t => `• ${t.title}`).join('\n')}`;
      }
      
      return response;
    }
    
    if (input.includes('study') && (input.includes('time') || input.includes('hour') || input.includes('focus'))) {
      const weekHours = getTotalStudyHours(7);
      const monthHours = getTotalStudyHours(30);
      const todaySessions = pomodoroSessions.filter(s => {
        const today = new Date().toISOString().split('T')[0];
        return s.completedAt.startsWith(today) && s.type === 'study';
      });
      const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
      
      return `Study time stats:
- **Today:** ${todayMinutes} minutes (${todaySessions.length} sessions)
- **This week:** ${weekHours} hours
- **This month:** ${monthHours} hours`;
    }
    
    if (input.includes('streak') || input.includes('habit')) {
      const streak = getStreak();
      const badge = getStreakBadge(streak);
      const today = new Date().getDay();
      const todayHabits = habits.filter(h => h.targetDays.includes(today));
      const completedToday = todayHabits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0]));
      
      return `Your current study streak is **${streak}** days ${badge.emoji} (${badge.label}).
      
Today: ${completedToday.length}/${todayHabits.length} habits completed.`;
    }
    
    if (input.includes('subject')) {
      if (subjects.length === 0) {
        return "You haven't added any subjects yet! Go to the Subjects page to add your courses.";
      }
      
      return `You have **${subjects.length}** subject${subjects.length > 1 ? 's' : ''}:\n${subjects.map(s => `• ${s.name}`).join('\n')}`;
    }
    
    if (input.includes('help')) {
      return `I can help you with:
- 📚 **"What should I study today?"** - Get study recommendations
- 📅 **"How many days until my exam?"** - Check upcoming exams
- 📊 **"What's my weakest subject?"** - Performance analysis
- 📈 **"What's my GPA?"** - Grade information
- ✅ **"How many tasks do I have?"** - Task overview
- ⏱️ **"How much have I studied?"** - Study time stats
- 🔥 **"What's my streak?"** - Habit tracking
- 📖 **"What subjects do I have?"** - Subject list

Ask me anything!`;
    }
    
    return `I'm your AI study assistant! I can help you with:
- Study recommendations
- Exam schedules
- Grade analysis
- Task management
- Study time tracking
- And more!

Type **"help"** to see all available commands.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMessage);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Study Assistant
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Ask me anything about your studies!
          </p>
        </div>
        {chatHistory.length > 0 && (
          <Button variant="ghost" onClick={clearChatHistory}>
            <Trash2 className="w-5 h-5" />
            Clear Chat
          </Button>
        )}
      </div>

      <Card className="h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                <Bot className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Hello! I&apos;m your AI Study Assistant
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                I can help you with study recommendations, exam schedules, grade analysis, and more. 
                Just ask me anything!
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  'What should I study today?',
                  'How many days until my exam?',
                  'What\'s my GPA?',
                  'How many tasks do I have?'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(suggestion); }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'user'
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'bg-[var(--accent)]'
                )}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[70%] p-4 rounded-2xl',
                  message.role === 'user'
                    ? 'bg-[var(--accent)] text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
