import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../lib/theme';
import { ToastProvider } from '../lib/toast';
import { AuthProvider } from '../lib/auth-context';
import { AppInitializer } from '../components/AppInitializer';

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'system') {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppInitializer>
                {children}
              </AppInitializer>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
