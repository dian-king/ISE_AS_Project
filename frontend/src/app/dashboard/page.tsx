'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { SchoolCrest } from '@/components/SchoolCrest';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  DRAFT:               { label: 'Draft',                dot: 'bg-gray-400',   color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  SUBMITTED:           { label: 'Submitted',            dot: 'bg-blue-500',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  AWAITING_DOCUMENTS:  { label: 'Awaiting Documents',   dot: 'bg-yellow-500', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  READY_FOR_REVIEW:    { label: 'Ready for Review',     dot: 'bg-indigo-500', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  ACADEMIC_REVIEW:     { label: 'Under Academic Review',dot: 'bg-purple-500', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  INTERVIEW_REQUIRED:  { label: 'Interview Required',   dot: 'bg-orange-500', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled',  dot: 'bg-orange-500', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  INTERVIEW_COMPLETED: { label: 'Interview Completed',  dot: 'bg-teal-500',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  COMMITTEE_REVIEW:    { label: 'Committee Review',     dot: 'bg-violet-500', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  ACCEPTED:            { label: 'Accepted',             dot: 'bg-green-500',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  WAITLISTED:          { label: 'Waitlisted',           dot: 'bg-yellow-500', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  REJECTED:            { label: 'Not Accepted',         dot: 'bg-red-500',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  OFFER_ACCEPTED:      { label: 'Offer Accepted',       dot: 'bg-green-500',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  OFFER_DECLINED:      { label: 'Offer Declined',       dot: 'bg-red-500',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  ENROLLMENT_PENDING:  { label: 'Enrollment Pending',   dot: 'bg-teal-500',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  ENROLLED:            { label: 'Enrolled',             dot: 'bg-green-600',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    apiFetch('/parents/applications')
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load applications'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] transition-colors">

      {/* Top Nav */}
      <nav className="bg-[#E8731A] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px]">
            <Link href="/" className="flex items-center gap-3">
              <SchoolCrest className="h-10 w-9" />
              <div className="hidden sm:block leading-tight">
                <div className="text-white font-bold text-sm tracking-wider uppercase">Excella</div>
                <div className="text-[#4DB8E8] text-[10px] font-medium tracking-[0.22em] uppercase">International School</div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="secondary" onClick={handleLogout} className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-sm py-1.5">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Track your admissions journey to Excella International School.</p>
            </div>
            <Button onClick={() => router.push('/apply')} className="shrink-0">
              + New Application
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your applications...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {!isLoading && applications.length === 0 && !error && (
          <div className="text-center py-20 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-[#E8731A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-[#E8731A] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">No applications yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm max-w-xs mx-auto">
              Start your child's admissions journey to Excella International School by creating your first application.
            </p>
            <Button onClick={() => router.push('/apply')}>Start Your First Application</Button>
          </div>
        )}

        <div className="space-y-4">
          {applications.map((app) => {
            const cfg = STATUS_CONFIG[app.status] ?? { label: app.status, dot: 'bg-gray-400', color: 'bg-gray-100 text-gray-700' };
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#E8731A]/10 dark:bg-[#E8731A]/30 rounded-xl flex items-center justify-center shrink-0 text-xl">
                      🎒
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg">
                          {app.applicantFirstName} {app.applicantLastName}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{app.gradeApplyingFor}</span>
                        {' · '}{app.academicYear}
                        {app.applicationNumber && <span className="font-mono text-xs ml-1 text-gray-400"> · {app.applicationNumber}</span>}
                      </p>
                      {app.submissionDate && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Submitted {new Date(app.submissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {app.status === 'ACCEPTED' && (
                      <Link href={`/offer/${app.id}`}>
                        <Button variant="gold" className="text-xs py-2 px-4">
                          🎉 View Offer
                        </Button>
                      </Link>
                    )}
                    <Link href={`/application/${app.id}/timeline`}>
                      <Button variant="secondary" className="text-xs py-2 px-4">
                        View Timeline
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
