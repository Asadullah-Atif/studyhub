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

const themeScript = `
  (function() {
    try {
      const stored = localStorage.getItem('study-app-storage');
      if (stored) {
        const data = JSON.parse(stored);
        const theme = data.state?.settings?.theme;
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'system') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          }
        }
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
