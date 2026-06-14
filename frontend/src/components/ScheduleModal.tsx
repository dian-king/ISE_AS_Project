'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '../lib/api';

interface ScheduleModalProps {
  applicationId: string;
  applicantName: string;
  onClose: () => void;
  onScheduled: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ applicationId, applicantName, onClose, onScheduled }) => {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          applicationId,
          interviewDate: new Date(date).toISOString(),
          location,
          notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to schedule interview');
      setSuccess(true);
      setTimeout(() => { onScheduled(); }, 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4A2F] dark:focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(8, 45, 29, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-[#0D4A2F] px-6 py-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-40 h-40" fill="none">
              <circle cx="160" cy="40" r="100" stroke="#C9A227" strokeWidth="1" />
              <circle cx="160" cy="40" r="60" stroke="#C9A227" strokeWidth="0.8" />
            </svg>
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">Admissions — Interview</p>
              <h2 className="font-display text-xl font-bold text-white leading-tight">Schedule Interview</h2>
              <p className="text-green-200 text-sm mt-1 truncate max-w-[260px]">{applicantName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-green-300 hover:text-white transition-colors mt-1 shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#0D4A2F] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-display font-bold text-gray-900 dark:text-white text-lg">Interview Scheduled</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">The applicant will be notified.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Location / Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 101 or https://zoom.us/j/..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Any additional instructions for the applicant..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#C9A227] hover:bg-[#E8C85A] text-[#082D1D] text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Scheduling…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Confirm Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
