'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, Calendar, ListTodo, Timer,
  BarChart3, BookOpen, FileText, Target, Moon, BookMarked,
  Library, Clock, Bot, Settings, ChevronLeft, ChevronRight,
  Brain, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exams', icon: GraduationCap, label: 'Exams' },
  { href: '/planner', icon: Calendar, label: 'Study Planner' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { href: '/grades', icon: BarChart3, label: 'Grades' },
  { href: '/flashcards', icon: Brain, label: 'Flashcards' },
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/habits', icon: Target, label: 'Habits' },
  { href: '/subjects', icon: BookOpen, label: 'Subjects' },
  { href: '/resources', icon: Library, label: 'Resources' },
  { href: '/goals', icon: Sparkles, label: 'Goals' },
  { href: '/sleep', icon: Moon, label: 'Sleep' },
  { href: '/timetable', icon: Clock, label: 'Timetable' },
  { href: '/assistant', icon: Bot, label: 'AI Assistant' },
  { href: '/analytics', icon: BookMarked, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            StudyHub
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
