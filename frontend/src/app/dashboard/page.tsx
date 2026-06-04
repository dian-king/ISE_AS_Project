'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Auth check removed
  }, [router]);

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">ISE&AS</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Welcome to your Admissions Dashboard</h2>
            <p className="mb-8 text-center max-w-md">
              From here you can start a new application, track existing ones, and manage your documents.
            </p>
            <Button onClick={() => router.push('/apply')}>
              Start New Application
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
