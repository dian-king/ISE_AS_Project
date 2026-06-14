'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SchoolCrest } from '@/components/SchoolCrest';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

const STAFF_ROLES = [
  'ADMISSIONS_OFFICER', 'REVIEWER', 'INTERVIEWER', 'ADMISSIONS_COMMITTEE',
  'PRINCIPAL', 'REGISTRAR', 'ADMINISTRATOR', 'SCHOOL_ADMINISTRATOR',
  'SUPER_ADMIN', 'CODAFRIQA_SUPPORT',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      router.push(STAFF_ROLES.includes(data.role) ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] bg-[#E8731A] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 right-0 w-80 h-80 opacity-10" viewBox="0 0 300 300" fill="none">
            <circle cx="250" cy="250" r="200" stroke="#4DB8E8" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="130" stroke="#4DB8E8" strokeWidth="1" />
            <circle cx="250" cy="250" r="60" stroke="#4DB8E8" strokeWidth="0.8" />
          </svg>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#4DB8E8] opacity-5 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        </div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <SchoolCrest className="h-10 w-9" />
          <div className="leading-tight">
            <div className="text-white font-bold text-sm tracking-wider uppercase">Excella</div>
            <div className="text-[#4DB8E8] text-[10px] font-medium tracking-[0.22em] uppercase">International School</div>
          </div>
        </Link>

        <div className="relative z-10">
          <SchoolCrest className="w-32 h-36 mx-auto mb-10 opacity-90 drop-shadow-xl" />
          <blockquote className="text-green-100 text-lg font-display italic leading-relaxed mb-4">
            "Education is the most powerful weapon which you can use to change the world."
          </blockquote>
          <cite className="text-[#4DB8E8] text-sm font-medium not-italic">— Nelson Mandela</cite>
        </div>

        <div className="relative z-10">
          <p className="text-green-400 text-xs">
            Kigali, Rwanda &middot; AMS Montessori &middot; Kimironko, Gasabo
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-[#F8F5EE] dark:bg-[#080f0a]">
        <div className="flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <SchoolCrest className="h-8 w-7" />
            <span className="text-[#E8731A] dark:text-green-400 font-bold text-sm">Excella</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Sign in to access your admissions portal.{' '}
                <Link href="/register" className="text-[#E8731A] dark:text-green-400 font-medium hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E8731A] dark:focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#E8731A] dark:text-green-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E8731A] dark:focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
              <Button type="submit" className="w-full py-3 text-sm" isLoading={isLoading}>
                Sign in to Portal
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                ← Back to Excella homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
