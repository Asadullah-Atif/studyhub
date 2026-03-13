'use client';

import { useState } from 'react';
import { Plus, X, GraduationCap, ListTodo, FileText, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '../lib/utils';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions = [
    {
      icon: GraduationCap,
      label: 'Add Exam',
      href: '/exams?add=true',
    },
    {
      icon: ListTodo,
      label: 'Add Task',
      href: '/tasks?add=true',
    },
    {
      icon: FileText,
      label: 'Add Note',
      href: '/notes?add=true',
    },
    {
      icon: Timer,
      label: 'Start Pomodoro',
      href: '/pomodoro',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div
        className={cn(
          'flex flex-col gap-2 mb-3 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <button
            key={action.label}
            onClick={() => {
              router.push(action.href);
              setIsOpen(false);
            }}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:shadow-xl transition-all duration-200 animate-fadeIn',
              `stagger-${index + 1}`
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon className="w-5 h-5 text-[var(--accent)]" />
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110',
          isOpen && 'rotate-45'
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
