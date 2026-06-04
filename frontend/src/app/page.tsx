'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiFetch } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePortalAccess = async (type: 'student' | 'admin') => {
     setIsLoading(type);
     try {
       // Clear old tokens to ensure fresh session
       localStorage.removeItem('token');
       localStorage.removeItem('role');

       // Auto-login with default credentials
       const credentials = type === 'admin' 
         ? { email: 'admin@iseas.com', password: 'admin123' }
         : { email: 'parent@test.com', password: 'password123' };

      const data = await apiFetch('/auth/authenticate', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      if (type === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Auto-login failed:', err);
      // Fallback to direct navigation if login fails (maybe backend is already open)
      if (type === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg transition-colors text-center">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-blue-900 dark:text-blue-400">
            Welcome to ISE&AS
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600 dark:text-gray-400">
            Please select your portal to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Student Portal Option */}
          <div className="flex flex-col items-center p-8 rounded-xl border-2 border-transparent hover:border-blue-500 bg-gray-50 dark:bg-gray-700/50 transition-all group">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 h-12">
              Apply for courses, track your application, and manage your student profile.
            </p>
            <Button 
              className="w-full py-6 text-lg" 
              onClick={() => handlePortalAccess('student')}
              isLoading={isLoading === 'student'}
              disabled={!!isLoading}
            >
              Student Portal
            </Button>
          </div>

          {/* Admin Portal Option */}
          <div className="flex flex-col items-center p-8 rounded-xl border-2 border-transparent hover:border-blue-500 bg-gray-50 dark:bg-gray-700/50 transition-all group">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Admin</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 h-12">
              Manage applications, process documents, and oversee school admissions.
            </p>
            <Button 
              variant="secondary" 
              className="w-full py-6 text-lg" 
              onClick={() => handlePortalAccess('admin')}
              isLoading={isLoading === 'admin'}
              disabled={!!isLoading}
            >
              Admin Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
