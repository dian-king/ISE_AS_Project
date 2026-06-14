'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type State = 'verifying' | 'success' | 'error' | 'missing';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'verifying' : 'missing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await apiFetch('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setState('success');
      } catch (err: any) {
        setErrorMsg(err.message || 'Verification failed. The link may have expired.');
        setState('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 hover:opacity-80">
            iga afriqa
          </Link>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Admissions Platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-10 text-center">
          {state === 'verifying' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Verifying your email…</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please wait a moment.</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your email address has been verified successfully. You can now log in to your account.
              </p>
              <Link
                href="/login"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Sign In
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6">{errorMsg}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Verification links expire after 24 hours. If your link has expired, you can request a new one by logging in.
              </p>
              <Link
                href="/login"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Sign In
              </Link>
            </>
          )}

          {state === 'missing' && (
            <>
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Token Found</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This page requires a valid verification link from your email. Please check your inbox and click the verification link we sent you.
              </p>
              <Link
                href="/"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Back to Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
