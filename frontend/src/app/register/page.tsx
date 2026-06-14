'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { SchoolCrest } from '@/components/SchoolCrest';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...formData, role: 'PARENT' }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'PARENT');
      setRegistered(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EE] dark:bg-[#080f0a] px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center">
          <div className="w-16 h-16 bg-[#E8731A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#E8731A] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            We sent a verification link to
          </p>
          <p className="font-semibold text-[#E8731A] dark:text-green-400 mb-4">{formData.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Click the link in that email to verify your account before continuing.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
            Can't find it? Check your spam folder. The link expires in 24 hours.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#E8731A] hover:bg-[#155D38] text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Continue to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'firstName', label: 'First name', placeholder: 'e.g. Amina', type: 'text' },
    { name: 'lastName', label: 'Last name', placeholder: 'e.g. Uwimana', type: 'text' },
    { name: 'email', label: 'Email address', placeholder: 'you@example.com', type: 'email' },
    { name: 'password', label: 'Password', placeholder: 'At least 8 characters', type: 'password' },
  ] as const;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] bg-[#E8731A] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-0 right-0 w-72 h-72 opacity-10" viewBox="0 0 300 300" fill="none">
            <circle cx="250" cy="50" r="200" stroke="#4DB8E8" strokeWidth="1.5" />
            <circle cx="250" cy="50" r="130" stroke="#4DB8E8" strokeWidth="1" />
          </svg>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#4DB8E8] opacity-5 translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <SchoolCrest className="h-10 w-9" />
          <div className="leading-tight">
            <div className="text-white font-bold text-sm tracking-wider uppercase">Excella</div>
            <div className="text-[#4DB8E8] text-[10px] font-medium tracking-[0.22em] uppercase">International School</div>
          </div>
        </Link>

        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-3xl font-bold text-white leading-tight">
            Begin Your Child's<br />
            <span className="text-[#4DB8E8] italic">Academic Journey</span>
          </h2>
          <p className="text-green-200 text-sm leading-relaxed max-w-sm">
            Join hundreds of families who have trusted Excella International School to provide a holistic Montessori and National Curriculum education for their children.
          </p>
          <div className="space-y-3">
            {[
              'Apply online in under 30 minutes',
              'Track your application status in real time',
              'Secure document upload portal',
              'Dedicated admissions team support',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-green-200 text-sm">
                <div className="w-5 h-5 rounded-full bg-[#4DB8E8]/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#4DB8E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-500 text-xs relative z-10">
          Kigali, Rwanda &middot; AMS Montessori &middot; Kimironko, Gasabo
        </p>
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
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-[#E8731A] dark:text-green-400 font-medium hover:underline">
                  Sign in here
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.slice(0, 2).map(({ name, label, placeholder, type }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                    <input
                      name={name}
                      type={type}
                      required
                      placeholder={placeholder}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E8731A] dark:focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>
                ))}
              </div>
              {fields.slice(2).map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input
                    name={name}
                    type={type}
                    required
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E8731A] dark:focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
              ))}

              <Button type="submit" className="w-full py-3 text-sm mt-2" isLoading={isLoading}>
                Create Account & Apply
              </Button>
            </form>

            <p className="mt-5 text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
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
