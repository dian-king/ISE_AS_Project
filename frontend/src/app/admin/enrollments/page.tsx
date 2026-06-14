'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface Enrollment {
  id: string;
  status: string;
  enrollmentDate: string | null;
  studentNumber: string | null;
  studentName?: string;
  grade?: string;
  offer?: { id: string; application?: { gradeApplyingFor?: string; applicant?: { firstName?: string; lastName?: string; } } };
  applicant?: { firstName?: string; lastName?: string; };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  ACTIVE:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  WITHDRAWN: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
};

function studentName(e: Enrollment): string {
  if (e.studentName) return e.studentName;
  const a = e.applicant ?? e.offer?.application?.applicant;
  if (a) return `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
  return 'Unknown Student';
}

function gradeLabel(e: Enrollment): string {
  return e.grade ?? e.offer?.application?.gradeApplyingFor ?? '—';
}

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/enrollments');
        setEnrollments(Array.isArray(data) ? data : data.content ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load enrollments');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    return !q
      || studentName(e).toLowerCase().includes(q)
      || (e.studentNumber ?? '').toLowerCase().includes(q)
      || gradeLabel(e).toLowerCase().includes(q)
      || e.status.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-[#E8731A] dark:text-green-400 hover:underline text-sm flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Enrollments</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Students who have accepted their offer and are enrolled</p>
            </div>
            <div className="flex gap-2 items-center bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-48"
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-32 gap-3 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading enrollments…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-[#E8731A]/10 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#E8731A] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="font-display text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {search ? 'No matching enrollments' : 'No enrollments yet'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {search ? 'Try a different search term.' : 'Enrollments will appear here once students accept their admission offers.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{filtered.length} enrollment{filtered.length !== 1 ? 's' : ''}</p>
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-[#F8F5EE] dark:bg-gray-900/40">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Student</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Student No.</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Grade</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {filtered.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{studentName(e)}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 font-mono text-xs">{e.studentNumber ?? '—'}</td>
                        <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">{gradeLabel(e)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[e.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{formatDate(e.enrollmentDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
