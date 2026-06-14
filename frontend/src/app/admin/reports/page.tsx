'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  AWAITING_DOCUMENTS: 'bg-orange-400',
  READY_FOR_REVIEW: 'bg-cyan-500',
  ACADEMIC_REVIEW: 'bg-purple-500',
  INTERVIEW_REQUIRED: 'bg-indigo-400',
  INTERVIEW_SCHEDULED: 'bg-indigo-500',
  INTERVIEW_COMPLETED: 'bg-violet-500',
  COMMITTEE_REVIEW: 'bg-fuchsia-500',
  ACCEPTED: 'bg-green-500',
  WAITLISTED: 'bg-amber-500',
  REJECTED: 'bg-red-500',
  OFFER_ACCEPTED: 'bg-emerald-500',
  OFFER_DECLINED: 'bg-rose-500',
  ENROLLMENT_PENDING: 'bg-teal-500',
  ENROLLED: 'bg-green-700',
};

export default function ReportsPage() {
  const [admissions, setAdmissions] = useState<any>(null);
  const [conversion, setConversion] = useState<any>(null);
  const [capacity, setCapacity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [admissionsData, conversionData, capacityData] = await Promise.all([
          apiFetch('/reports/admissions'),
          apiFetch('/reports/conversion'),
          apiFetch('/reports/capacity'),
        ]);
        setAdmissions(admissionsData);
        setConversion(conversionData);
        setCapacity(capacityData);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading reports...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Admissions Reports</h1>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* By Status */}
        {admissions?.byStatus && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Applications by Status</h2>
            <div className="space-y-3">
              {Object.entries(admissions.byStatus as Record<string, number>)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([status, count]) => {
                  const total = Object.values(admissions.byStatus as Record<string, number>).reduce((sum: number, c) => sum + (c as number), 0);
                  const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-900 dark:text-white font-bold">{count as number} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Grade */}
          {admissions?.byGrade && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Applications by Grade</h2>
              <div className="space-y-2">
                {Object.entries(admissions.byGrade as Record<string, number>)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([grade, count]) => (
                    <div key={grade} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Grade {grade}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{count as number}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Capacity */}
          {capacity && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Accepted by Grade</h2>
              <div className="space-y-2">
                {Object.keys(capacity).length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No acceptances yet.</p>
                ) : (
                  Object.entries(capacity as Record<string, number>)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([grade, count]) => (
                      <div key={grade} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Grade {grade}</span>
                        <span className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">{count as number} accepted</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conversion Rates */}
        {conversion && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Conversion Rates</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(conversion as Record<string, number>).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {typeof value === 'number' ? (value % 1 === 0 ? value : `${(value * 100).toFixed(1)}%`) : value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
