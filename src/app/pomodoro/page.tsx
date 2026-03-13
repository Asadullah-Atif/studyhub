'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer, Play, Pause, RotateCcw, Coffee, Target, Volume2,
  Clock, Flame, BookOpen
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Select, ProgressBar } from '../../components/ui';
import { generateId, cn } from '../../lib/utils';

type TimerMode = 'study' | 'short-break' | 'long-break';

export default function PomodoroPage() {
  const { subjects, pomodoroSessions, addPomodoroSession, settings, addActivity } = useStore();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroWork * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const modes = {
    study: { 
      duration: settings.pomodoroWork, 
      label: 'Focus Time', 
      color: 'bg-green-500',
      nextMode: 'short-break' as TimerMode
    },
    'short-break': { 
      duration: settings.pomodoroShortBreak, 
      label: 'Short Break', 
      color: 'bg-blue-500',
      nextMode: 'study' as TimerMode
    },
    'long-break': { 
      duration: settings.pomodoroLongBreak, 
      label: 'Long Break', 
      color: 'bg-purple-500',
      nextMode: 'study' as TimerMode
    },
  };

  useEffect(() => {
    setTimeLeft(modes[mode].duration * 60);
    setIsRunning(false);
  }, [mode, settings]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = pomodoroSessions.filter(
      s => s.completedAt.startsWith(today) && s.type === 'study'
    );
    const focusTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    setTotalFocusTime(focusTime + (sessionsCompleted * settings.pomodoroWork));
  }, [pomodoroSessions, sessionsCompleted, settings.pomodoroWork]);

  const playSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const handleComplete = useCallback(() => {
    playSound();
    setIsRunning(false);
    
    if (mode === 'study') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      addPomodoroSession({
        id: generateId(),
        subjectId: selectedSubject || undefined,
        duration: settings.pomodoroWork,
        type: 'study',
        completedAt: new Date().toISOString(),
      });

      addActivity({
        id: generateId(),
        type: 'session',
        action: 'completed',
        description: `Completed ${settings.pomodoroWork} min focus session`,
        timestamp: new Date().toISOString(),
      });

      showToast('success', 'Great job! Session completed!');
      
      if (newSessionsCompleted % 4 === 0) {
        setMode('long-break');
      } else {
        setMode('short-break');
      }
    } else {
      showToast('info', 'Break time over! Ready to focus?');
      setMode('study');
    }
  }, [mode, sessionsCompleted, selectedSubject, settings, addPomodoroSession, addActivity, showToast, playSound]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = modes[mode].duration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const todaySessions = pomodoroSessions.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.completedAt.startsWith(today) && s.type === 'study';
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pomodoro Timer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Stay focused with the Pomodoro technique
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="text-center py-12">
            <div className="flex justify-center gap-2 mb-8">
              {(['study', 'short-break', 'long-break'] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all',
                    mode === m
                      ? `${modes[m].color} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {modes[m].label}
                </button>
              ))}
            </div>

            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={cn('transition-all duration-1000', modes[mode].color)}
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - getProgress() / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-900 dark:text-white">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-32"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={resetTimer}
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </div>

            <div className="mt-8 max-w-xs mx-auto">
              <Select
                value={selectedSubject}
                onChange={setSelectedSubject}
                options={[
                  { value: '', label: 'No subject selected' },
                  ...subjects.map(s => ({ value: s.id, label: s.name }))
                ]}
                label="Track time for subject"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Today&apos;s Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Sessions Completed</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {todaySessions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Total Focus Time</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {totalFocusTime} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Target className="w-5 h-5 text-green-500" />
                  <span>Current Streak</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {sessionsCompleted}
                </span>
              </div>
              <ProgressBar value={sessionsCompleted % 4} max={4} showLabel />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {4 - (sessionsCompleted % 4)} sessions until long break
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Session History
            </h3>
            {todaySessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No sessions today
              </p>
            ) : (
              <div className="space-y-2">
                {todaySessions.slice(-5).reverse().map(session => {
                  const subject = subjects.find(s => s.id === session.subjectId);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: subject?.color || '#6B7280' }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {subject?.name || 'General'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {session.duration} min
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Timer Settings
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Focus Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {settings.pomodoroWork} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Short Break</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {settings.pomodoroShortBreak} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Long Break</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {settings.pomodoroLongBreak} min
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                Change timer settings in Settings page
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
