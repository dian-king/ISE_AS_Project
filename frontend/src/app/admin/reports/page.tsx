'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface FunnelStage { stage: string; count: number; }
interface AdmissionsReport {
  schoolName: string; academicYear: string;
  pipeline: FunnelStage[]; byGrade: FunnelStage[]; byNationality: FunnelStage[];
  totalApplications: number; submitted: number; underReview: number;
  accepted: number; rejected: number; waitlisted: number; enrolled: number;
  acceptanceRate: number; yieldRate: number;
}
interface ConversionReport {
  academicYear: string;
  totalApplications: number; submittedApplications: number; reviewedApplications: number;
  interviewedApplications: number; decisionsMade: number; accepted: number; offersAccepted: number; enrolled: number;
  submissionRate: number; reviewToSubmissionRate: number; interviewToReviewRate: number;
  decisionToInterviewRate: number; acceptanceRate: number; offerAcceptanceRate: number;
  enrollmentConversionRate: number; overallConversionRate: number;
}
interface GradeCapacity { grade: string; totalCapacity: number; enrolled: number; pending: number; availableSpots: number; fillRate: number; }
interface CapacityReport { schoolName: string; academicYear: string; grades: GradeCapacity[]; totalCapacity: number; totalEnrolled: number; totalAvailable: number; }

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-500', UNDER_REVIEW: 'bg-yellow-500', AWAITING_DOCUMENTS: 'bg-orange-400',
  READY_FOR_REVIEW: 'bg-cyan-500', ACADEMIC_REVIEW: 'bg-purple-500',
  INTERVIEW_REQUIRED: 'bg-indigo-400', INTERVIEW_SCHEDULED: 'bg-indigo-500',
  INTERVIEW_COMPLETED: 'bg-violet-500', COMMITTEE_REVIEW: 'bg-fuchsia-500',
  ACCEPTED: 'bg-green-500', WAITLISTED: 'bg-amber-500', REJECTED: 'bg-red-500',
  OFFER_ACCEPTED: 'bg-emerald-500', OFFER_DECLINED: 'bg-rose-500',
  ENROLLMENT_PENDING: 'bg-teal-500', ENROLLED: 'bg-[#E8731A]',
};

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }

export default function ReportsPage() {
  const [admissions, setAdmissions] = useState<AdmissionsReport | null>(null);
  const [conversion, setConversion] = useState<ConversionReport | null>(null);
  const [capacity, setCapacity] = useState<CapacityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [a, c, cap] = await Promise.all([
          apiFetch('/reports/admissions'),
          apiFetch('/reports/conversion'),
          apiFetch('/reports/capacity'),
        ]);
        setAdmissions(a);
        setConversion(c);
        setCapacity(cap);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-gray-500 dark:text-gray-400">
      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading reports…
    </div>
  );

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
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Admissions Reports</h1>
          {admissions && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {admissions.schoolName} · {admissions.academicYear}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        {admissions && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Applications', value: admissions.totalApplications, color: 'text-[#E8731A] dark:text-green-400', border: 'border-l-[#E8731A]' },
              { label: 'Accepted', value: admissions.accepted, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500' },
              { label: 'Acceptance Rate', value: pct(admissions.acceptanceRate), color: 'text-amber-600 dark:text-amber-400', border: 'border-l-amber-500' },
              { label: 'Yield Rate', value: pct(admissions.yieldRate), color: 'text-violet-600 dark:text-violet-400', border: 'border-l-violet-500' },
            ].map(({ label, value, color, border }) => (
              <div key={label} className={`bg-white dark:bg-gray-800/60 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 ${border}`}>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pipeline by Status */}
        {admissions?.pipeline && admissions.pipeline.length > 0 && (
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-5">Admissions Pipeline</h2>
            <div className="space-y-3">
              {admissions.pipeline
                .slice().sort((a, b) => b.count - a.count)
                .map(({ stage, count }) => {
                  const total = admissions.totalApplications || 1;
                  const p = Math.round((count / total) * 100);
                  return (
                    <div key={stage}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{stage.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {count} <span className="text-gray-400 font-normal">({p}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${STATUS_COLORS[stage] ?? 'bg-gray-400'}`}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* By Grade */}
          {admissions?.byGrade && admissions.byGrade.length > 0 && (
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-4">Applications by Grade</h2>
              <div className="space-y-1">
                {admissions.byGrade
                  .slice().sort((a, b) => b.count - a.count)
                  .map(({ stage, count }) => (
                    <div key={stage} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{stage}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Capacity by Grade */}
          {capacity?.grades && capacity.grades.length > 0 && (
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-1">Grade Capacity</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Total capacity: {capacity.totalCapacity} · Enrolled: {capacity.totalEnrolled} · Available: {capacity.totalAvailable}
              </p>
              <div className="space-y-3">
                {capacity.grades.map((g) => (
                  <div key={g.grade}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{g.grade}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {g.enrolled}/{g.totalCapacity} enrolled · {g.availableSpots} spots left
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#E8731A]"
                        style={{ width: `${Math.min(g.fillRate * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        {conversion && (
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-5">Conversion Funnel</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Submitted', value: conversion.submittedApplications, sub: null },
                { label: 'Reviewed', value: conversion.reviewedApplications, sub: pct(conversion.reviewToSubmissionRate) + ' of submitted' },
                { label: 'Interviewed', value: conversion.interviewedApplications, sub: pct(conversion.interviewToReviewRate) + ' of reviewed' },
                { label: 'Decisions', value: conversion.decisionsMade, sub: pct(conversion.decisionToInterviewRate) + ' of interviewed' },
                { label: 'Accepted', value: conversion.accepted, sub: pct(conversion.acceptanceRate) + ' acceptance rate' },
                { label: 'Offers Accepted', value: conversion.offersAccepted, sub: pct(conversion.offerAcceptanceRate) + ' of accepted' },
                { label: 'Enrolled', value: conversion.enrolled, sub: pct(conversion.overallConversionRate) + ' overall yield' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="text-center p-4 bg-[#F8F5EE] dark:bg-gray-900/40 rounded-xl">
                  <div className="font-display text-2xl font-bold text-[#E8731A] dark:text-green-400">{value}</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">{label}</div>
                  {sub && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!error && !admissions && !isLoading && (
          <div className="text-center py-20 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 dark:text-gray-500">No report data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
