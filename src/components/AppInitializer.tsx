'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { FloatingActionButton } from '@/components/FloatingActionButton';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isDemoMode } = useAuth();
  const { initialize, initialized } = useStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      initialize('demo-user');
    } else if (user && !initialized) {
      initialize(user.id);
    }
  }, [user, initialized, initialize, isDemoMode]);

  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isDemoMode && !user) {
    router.push('/login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="ml-64 p-6 min-h-screen">
        {children}
      </main>
      <FloatingActionButton />
    </>
  );
}
