'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { ScheduleModal } from '@/components/ScheduleModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const STATUS_OPTIONS = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'INCOMPLETE',
  'AWAITING_DOCUMENTS',
  'INTERVIEW_SCHEDULED',
  'ACCEPTED',
  'REJECTED'
];

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const [appsData, statsData] = await Promise.all([
        apiFetch('/applications'),
        apiFetch('/applications/stats')
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/applications/${id}/status?status=${newStatus}`, {
        method: 'PUT',
      });
      // Refresh local state
      setApplications(apps => apps.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center dark:text-white">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      {selectedApp && (
        <ScheduleModal 
          applicationId={selectedApp.id}
          applicantName={`${selectedApp.applicantFirstName} ${selectedApp.applicantLastName}`}
          onClose={() => setSelectedApp(null)}
          onScheduled={() => {
            setSelectedApp(null);
            fetchApplications();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admissions Review Dashboard</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button onClick={fetchApplications}>Refresh</Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500">
              <div className="text-sm text-gray-500 dark:text-gray-300 uppercase font-bold">Total Applications</div>
              <div className="text-2xl font-bold dark:text-white">{stats.totalApplications}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-yellow-500">
              <div className="text-sm text-gray-500 dark:text-gray-300 uppercase font-bold">Pending</div>
              <div className="text-2xl font-bold dark:text-white">{stats.pendingApplications}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500">
              <div className="text-sm text-gray-500 dark:text-gray-300 uppercase font-bold">Accepted</div>
              <div className="text-2xl font-bold dark:text-white">{stats.acceptedApplications}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-red-500">
              <div className="text-sm text-gray-500 dark:text-gray-300 uppercase font-bold">Rejected</div>
              <div className="text-2xl font-bold dark:text-white">{stats.rejectedApplications}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-8 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-300">No applications found</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{app.applicantFirstName} {app.applicantLastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {app.gradeApplyingFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900 dark:text-white font-medium">{app.parentName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{app.parentEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                          app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <select 
                          className="border dark:border-gray-600 rounded text-sm p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <Link href={`/admin/applications/${app.id}`}>
                          <Button variant="secondary" className="py-1 px-2 text-xs">
                            View
                          </Button>
                        </Link>
                        <Button variant="secondary" className="py-1 px-2 text-xs" onClick={() => setSelectedApp(app)}>
                          Schedule
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
