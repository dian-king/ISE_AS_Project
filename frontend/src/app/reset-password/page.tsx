'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Your link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-10 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This page requires a valid password reset link from your email.
          </p>
          <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 hover:opacity-80">
            iga afriqa
          </Link>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Admissions Platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your password has been updated. Redirecting you to Sign In…
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set a new password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose a strong password of at least 8 characters.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter your new password"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength =
                          newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                          : newPassword.length >= 10 && (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) ? 3
                          : newPassword.length >= 8 ? 2
                          : 1;
                        return (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${
                              level <= strength
                                ? strength === 4 ? 'bg-green-500'
                                  : strength === 3 ? 'bg-blue-500'
                                  : strength === 2 ? 'bg-yellow-500'
                                  : 'bg-red-400'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400">
                      {newPassword.length < 8 ? 'Too short'
                        : newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'Strong password'
                        : newPassword.length >= 10 ? 'Good password'
                        : 'Acceptable — consider adding numbers or uppercase letters'}
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Set New Password
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
