import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../lib/theme';
import { ToastProvider } from '../lib/toast';
import { Sidebar } from '../components/Sidebar';
import { FloatingActionButton } from '../components/FloatingActionButton';

export const metadata: Metadata = {
  title: 'StudyHub - Study & Exam Management',
  description: 'A comprehensive study and exam management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors">
        <ThemeProvider>
          <ToastProvider>
            <Sidebar />
            <main className="ml-64 p-6 min-h-screen">
              {children}
            </main>
            <FloatingActionButton />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
