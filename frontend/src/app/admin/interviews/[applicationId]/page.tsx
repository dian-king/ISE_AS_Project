'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const OUTCOMES = [
  { value: 'PASS', label: 'Pass', color: 'text-green-600 dark:text-green-400' },
  { value: 'CONDITIONAL_PASS', label: 'Conditional Pass', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'WAITLIST', label: 'Waitlist', color: 'text-orange-600 dark:text-orange-400' },
  { value: 'FAIL', label: 'Fail', color: 'text-red-600 dark:text-red-400' },
];

const RUBRIC = [
  { field: 'communicationScore', label: 'Communication Skills' },
  { field: 'confidenceScore', label: 'Confidence' },
  { field: 'academicReadinessScore', label: 'Academic Readiness' },
  { field: 'languageScore', label: 'Language Skills' },
  { field: 'behavioralScore', label: 'Behavioral Qualities' },
  { field: 'criticalThinkingScore', label: 'Critical Thinking' },
];

export default function InterviewEvaluationPage() {
  const { applicationId } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [scores, setScores] = useState<Record<string, number>>({
    communicationScore: 5,
    confidenceScore: 5,
    academicReadinessScore: 5,
    languageScore: 5,
    behavioralScore: 5,
    criticalThinkingScore: 5,
  });
  const [outcome, setOutcome] = useState('PASS');
  const [evaluationNotes, setEvaluationNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appData, interviewData] = await Promise.all([
          apiFetch(`/applications/${applicationId}`),
          apiFetch(`/interviews/application/${applicationId}`),
        ]);
        setApplication(appData);
        setInterview(interviewData);

        if (interviewData?.outcome) {
          setScores({
            communicationScore: interviewData.communicationScore ?? 5,
            confidenceScore: interviewData.confidenceScore ?? 5,
            academicReadinessScore: interviewData.academicReadinessScore ?? 5,
            languageScore: interviewData.languageScore ?? 5,
            behavioralScore: interviewData.behavioralScore ?? 5,
            criticalThinkingScore: interviewData.criticalThinkingScore ?? 5,
          });
          setOutcome(interviewData.outcome);
          setEvaluationNotes(interviewData.evaluationNotes ?? '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load interview');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [applicationId]);

  const overallScore = Math.round(
    Object.values(scores).reduce((sum, v) => sum + v, 0) / Object.keys(scores).length * 10
  ) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/interviews/${interview.id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ ...scores, outcome, evaluationNotes }),
      });
      alert('Evaluation submitted successfully.');
      router.push(`/admin/applications/${applicationId}`);
    } catch (err: any) {
      alert('Failed to submit evaluation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading interview details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!interview) return (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      No interview scheduled for this application.{' '}
      <Link href={`/admin/applications/${applicationId}`} className="text-blue-600 dark:text-blue-400 hover:underline">Go back</Link>
    </div>
  );

  const isCompleted = interview.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href={`/admin/applications/${applicationId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Application
          </Link>
          <ThemeToggle />
        </div>

        {/* Interview Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Interview Evaluation</h1>
              {application && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {application.applicantFirstName} {application.applicantLastName} &middot; {application.gradeApplyingFor}
                  {application.applicationNumber && (
                    <span className="ml-2 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{application.applicationNumber}</span>
                  )}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {interview.status}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Scheduled Date</dt>
              <dd className="text-sm text-gray-900 dark:text-white mt-0.5">
                {new Date(interview.interviewDate).toLocaleString()}
              </dd>
            </div>
            {interview.location && (
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Location / Link</dt>
                <dd className="text-sm text-gray-900 dark:text-white mt-0.5">{interview.location}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Evaluation Rubric</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overallScore}/10</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Overall Score</div>
              </div>
            </div>

            <div className="space-y-5">
              {RUBRIC.map(({ field, label }) => (
                <div key={field}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{scores[field]}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={scores[field]}
                    onChange={(e) => setScores(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
                    disabled={isCompleted}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    <span>1 - Poor</span>
                    <span>10 - Excellent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Outcome & Notes</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interview Outcome</label>
              <div className="grid grid-cols-2 gap-3">
                {OUTCOMES.map(({ value, label, color }) => (
                  <label
                    key={value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      outcome === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    } ${isCompleted ? 'pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name="outcome"
                      value={value}
                      checked={outcome === value}
                      onChange={(e) => setOutcome(e.target.value)}
                      disabled={isCompleted}
                      className="mr-2"
                    />
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evaluation Notes
              </label>
              <textarea
                value={evaluationNotes}
                onChange={(e) => setEvaluationNotes(e.target.value)}
                disabled={isCompleted}
                rows={4}
                placeholder="Provide detailed notes on the candidate's performance..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>
          </div>

          {isCompleted ? (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm">
              This interview has already been evaluated by {interview.evaluatedBy} on {new Date(interview.evaluatedAt).toLocaleDateString()}.
            </div>
          ) : (
            <Button type="submit" className="w-full py-3" isLoading={isSubmitting}>
              Submit Evaluation
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
