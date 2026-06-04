'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch(`/applications/${id}`);
      setApplication(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiFetch(`/applications/${id}/status?status=${newStatus}`, {
        method: 'PUT',
      });
      fetchApplication();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading application details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!application) return <div className="p-8 text-center">Application not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={() => handleStatusChange('UNDER_REVIEW')}>Review</Button>
              <Button onClick={() => handleStatusChange('ACCEPTED')} className="bg-green-600 hover:bg-green-700">Accept</Button>
              <Button onClick={() => handleStatusChange('REJECTED')} className="bg-red-600 hover:bg-red-700">Reject</Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Application Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Student and parent details.</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold 
              ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                application.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {application.status}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {application.applicantFirstName} {application.applicantLastName}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rwandan Details</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>National ID:</strong> {application.nationalId || 'N/A'}</p>
                    <p><strong>Ubudehe:</strong> {application.ubudeheCategory || 'N/A'}</p>
                    <p><strong>Index No:</strong> {application.nationalExamIndexNumber || 'N/A'}</p>
                    <p><strong>Combination:</strong> {application.combination || 'N/A'}</p>
                    <p><strong>Languages:</strong> {application.languageProficiency || 'N/A'}</p>
                  </div>
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Grade Applying For</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{application.gradeApplyingFor}</dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Home Address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <p>{application.village}, {application.cell}, {application.sector}, {application.district}, {application.province}</p>
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Details</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <p>{application.parentName} ({application.parentEmail})</p>
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submission Date</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {new Date(application.submissionDate).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Internal Notes</h3>
          <textarea 
            className="w-full border dark:border-gray-600 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={4}
            placeholder="Add review notes here..."
          ></textarea>
          <div className="mt-3 flex justify-end">
            <Button variant="secondary">Save Notes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
