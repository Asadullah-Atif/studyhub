'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-left transition-colors',
          'hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50'
        )}
      >
        <span
          className={cn(
            selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500'
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                option.value === value
                  ? 'text-[var(--accent)] bg-[var(--accent)]/5'
                  : 'text-gray-900 dark:text-gray-100'
              )}
            >
              {option.label}
              {option.value === value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors',
          'hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors resize-none',
          'hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:opacity-90 shadow-md',
    secondary:
      'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
    ghost:
      'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200',
        onClick && 'hover:shadow-lg hover:border-[var(--accent)] cursor-pointer text-left w-full',
        className
      )}
    >
      {children}
    </Component>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
        {description}
      </p>
      {action}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className, showLabel }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
