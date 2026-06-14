'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const COMPLETED_STAGES = [
  { key: 'SUBMITTED', label: 'Application Submitted' },
  { key: 'AWAITING_DOCUMENTS', label: 'Document Collection' },
  { key: 'READY_FOR_REVIEW', label: 'Ready for Review' },
  { key: 'ACADEMIC_REVIEW', label: 'Academic Review' },
  { key: 'INTERVIEW_REQUIRED', label: 'Interview' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { key: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
  { key: 'COMMITTEE_REVIEW', label: 'Committee Review' },
  { key: 'ACCEPTED', label: 'Decision' },
  { key: 'OFFER_ACCEPTED', label: 'Offer Accepted' },
  { key: 'ENROLLED', label: 'Enrolled' },
];

export default function TimelinePage() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timelineData, appData] = await Promise.all([
          apiFetch(`/applications/${id}/timeline`),
          apiFetch(`/applications/${id}`),
        ]);
        setTimeline(Array.isArray(timelineData) ? timelineData : []);
        setApplication(appData);
      } catch (err) {
        console.error('Failed to load timeline');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const completedStatuses = new Set(timeline.map(t => t.status));

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading timeline...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Application Timeline</h1>
          {application && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {application.applicantFirstName} {application.applicantLastName} &middot; {application.gradeApplyingFor}
              {application.applicationNumber && <span className="ml-2 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{application.applicationNumber}</span>}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-4">
            {COMPLETED_STAGES.map((stage) => {
              const historyEntry = timeline.find(t => t.status === stage.key);
              const isCompleted = completedStatuses.has(stage.key);
              const isCurrent = application?.status === stage.key;

              return (
                <div key={stage.key} className="relative flex items-start pl-14">
                  <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    )}
                  </div>
                  <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex-1 shadow-sm ${
                    isCurrent ? 'border-blue-300 dark:border-blue-600 ring-1 ring-blue-300 dark:ring-blue-600' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${isCompleted || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {stage.label}
                        {isCurrent && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Current</span>}
                      </h3>
                      {historyEntry?.changedAt && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(historyEntry.changedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {historyEntry?.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{historyEntry.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
