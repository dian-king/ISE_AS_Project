'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { ScheduleModal } from '@/components/ScheduleModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const STATUS_OPTIONS = [
  'SUBMITTED', 'UNDER_REVIEW', 'INCOMPLETE', 'AWAITING_DOCUMENTS',
  'READY_FOR_REVIEW', 'ACADEMIC_REVIEW', 'INTERVIEW_REQUIRED',
  'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'COMMITTEE_REVIEW',
  'ACCEPTED', 'WAITLISTED', 'REJECTED', 'ENROLLMENT_PENDING', 'ENROLLED',
];

const STATUS_BADGE: Record<string, string> = {
  ACCEPTED:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ENROLLED:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  REJECTED:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  WAITLISTED:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  UNDER_REVIEW:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  SUBMITTED:   'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const STATS_CONFIG = [
  { key: 'totalApplications',   label: 'Total Applications', icon: '📋', border: 'border-l-[#0D4A2F]',  text: 'text-[#0D4A2F] dark:text-green-400' },
  { key: 'pendingApplications', label: 'Pending Review',     icon: '⏳', border: 'border-l-amber-500',  text: 'text-amber-600 dark:text-amber-400' },
  { key: 'acceptedApplications',label: 'Accepted',           icon: '✅', border: 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'rejectedApplications',label: 'Not Accepted',       icon: '❌', border: 'border-l-red-500',     text: 'text-red-600 dark:text-red-400' },
];

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [appsData, statsData] = await Promise.all([
        apiFetch('/applications'),
        apiFetch('/applications/stats'),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/applications/${id}/status?status=${newStatus}`, { method: 'PUT' });
      setApplications(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EE] dark:bg-[#080f0a]">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] transition-colors">
      {selectedApp && (
        <ScheduleModal
          applicationId={selectedApp.id}
          applicantName={`${selectedApp.applicantFirstName} ${selectedApp.applicantLastName}`}
          onClose={() => setSelectedApp(null)}
          onScheduled={() => { setSelectedApp(null); fetchData(); }}
        />
      )}

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Admissions Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Greenwood International School · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/admin/reports">
              <Button variant="secondary" className="text-sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reports
              </Button>
            </Link>
            <Button onClick={fetchData} className="text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STATS_CONFIG.map(({ key, label, icon, border, text }) => (
              <div
                key={key}
                className={`bg-white dark:bg-gray-800/60 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 ${border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                  <span className="text-xl">{icon}</span>
                </div>
                <div className={`font-display text-3xl font-bold ${text}`}>{stats[key] ?? 0}</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg">All Applications</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{applications.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40">
                  {['Applicant', 'Grade', 'Parent / Guardian', 'Date Submitted', 'Status', 'Actions'].map(col => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const badgeClass = STATUS_BADGE[app.status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                    return (
                      <tr key={app.id} className="hover:bg-[#0D4A2F]/[0.03] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0D4A2F]/10 flex items-center justify-center text-[#0D4A2F] dark:text-green-400 text-xs font-bold shrink-0">
                              {(app.applicantFirstName?.[0] ?? '?').toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {app.applicantFirstName} {app.applicantLastName}
                              </div>
                              {app.applicationNumber && (
                                <div className="text-xs text-gray-400 font-mono">{app.applicationNumber}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {app.gradeApplyingFor}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{app.parentName}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{app.parentEmail}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {app.submissionDate
                            ? new Date(app.submissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${badgeClass}`}>
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={app.status}
                              onChange={e => handleStatusChange(app.id, e.target.value)}
                              className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0D4A2F]"
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            <Link href={`/admin/applications/${app.id}`}>
                              <Button variant="secondary" className="py-1.5 px-3 text-xs">
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="secondary"
                              className="py-1.5 px-3 text-xs"
                              onClick={() => setSelectedApp(app)}
                            >
                              Schedule
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
