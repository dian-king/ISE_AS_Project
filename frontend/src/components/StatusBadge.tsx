'use client';

import React from 'react';

const STATUS_COLORS: Record<string, string> = {
  // Application statuses
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  AWAITING_DOCUMENTS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  READY_FOR_REVIEW: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ACADEMIC_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  INTERVIEW_REQUIRED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  INTERVIEW_SCHEDULED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  INTERVIEW_COMPLETED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  COMMITTEE_REVIEW: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  WAITLISTED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  OFFER_ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  OFFER_DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ENROLLMENT_PENDING: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  ENROLLED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  // User statuses
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  SUSPENDED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DEACTIVATED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // Document statuses
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  VERIFIED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REQUIRES_RESUBMISSION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  // Enrollment statuses
  PENDING_FORM: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  FORM_SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};
