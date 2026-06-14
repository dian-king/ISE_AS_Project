'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const STATUS_BADGE: Record<string, string> = {
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  WAITLISTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const DOC_BADGE: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  VERIFIED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REQUIRES_RESUBMISSION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'review' | 'decision'>('details');

  // Review state
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [reviewScores, setReviewScores] = useState({ academicScore: 0, languageScore: 0, behaviorScore: 0, extracurricularScore: 0 });
  const [reviewRecommendation, setReviewRecommendation] = useState('RECOMMEND');
  const [reviewComments, setReviewComments] = useState('');

  // Decision state
  const [decision, setDecision] = useState('ACCEPTED');
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [appData, docsData, reviewsData, reviewersData] = await Promise.all([
        apiFetch(`/applications/${id}`),
        apiFetch(`/documents?applicationId=${id}`),
        apiFetch(`/reviews?applicationId=${id}`),
        apiFetch('/staff/reviewers'),
      ]);
      setApplication(appData);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setReviewers(Array.isArray(reviewersData) ? reviewersData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiFetch(`/applications/${id}/status?status=${newStatus}`, { method: 'PUT' });
      fetchAll();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleVerifyDocument = async (docId: string, status: string, rejectionReason?: string) => {
    try {
      await apiFetch(`/documents/${docId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status, rejectionReason }),
      });
      fetchAll();
    } catch (err: any) {
      alert('Failed to verify document: ' + err.message);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewer) return alert('Please select a reviewer');
    try {
      await apiFetch('/review-assignments', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id, reviewerId: selectedReviewer }),
      });
      alert('Reviewer assigned successfully');
      fetchAll();
    } catch (err: any) {
      alert('Failed to assign reviewer: ' + err.message);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: id,
          ...reviewScores,
          recommendation: reviewRecommendation,
          comments: reviewComments,
        }),
      });
      alert('Review submitted successfully');
      fetchAll();
    } catch (err: any) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDecision = async () => {
    if (!decisionReason.trim()) return alert('Please provide a decision reason');
    setSubmitting(true);
    try {
      await apiFetch('/decisions', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id, decision, decisionReason }),
      });
      alert(`Decision recorded: ${decision}`);
      fetchAll();
    } catch (err: any) {
      alert('Failed to record decision: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading application details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!application) return <div className="p-8 text-center">Application not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGE[application.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
              {application.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {application.applicantFirstName} {application.applicantLastName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {application.gradeApplyingFor} &middot; {application.academicYear}
                {application.applicationNumber && <span className="ml-2 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{application.applicationNumber}</span>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="text-sm" onClick={() => handleStatusChange('READY_FOR_REVIEW')}>Mark Ready</Button>
              <Button variant="secondary" className="text-sm" onClick={() => handleStatusChange('INTERVIEW_REQUIRED')}>Request Interview</Button>
              <Button variant="secondary" className="text-sm" onClick={() => handleStatusChange('COMMITTEE_REVIEW')}>Send to Committee</Button>
              {(application.status === 'INTERVIEW_SCHEDULED' || application.status === 'INTERVIEW_COMPLETED') && (
                <Link href={`/admin/interviews/${id}`}>
                  <Button className="text-sm bg-indigo-600 hover:bg-indigo-700">Evaluate Interview</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['details', 'documents', 'review', 'decision'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab === 'review' ? 'Academic Review' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
            <dl>
              {[
                ['Full Name', `${application.applicantFirstName} ${application.applicantLastName}`],
                ['Grade Applying For', application.gradeApplyingFor],
                ['Academic Year', application.academicYear],
                ['Parent Name', application.parentName],
                ['Parent Email', application.parentEmail],
                ['National ID', application.nationalId || 'N/A'],
                ['Ubudehe Category', application.ubudeheCategory || 'N/A'],
                ['Exam Index No.', application.nationalExamIndexNumber || 'N/A'],
                ['Combination', application.combination || 'N/A'],
                ['Language Proficiency', application.languageProficiency || 'N/A'],
                ['Address', [application.village, application.cell, application.sector, application.district, application.province].filter(Boolean).join(', ') || 'N/A'],
                ['Submission Date', application.submissionDate ? new Date(application.submissionDate).toLocaleString() : 'N/A'],
              ].map(([label, value], i) => (
                <div key={label} className={`px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/30'}`}>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {documents.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-500 dark:text-gray-400">
                No documents uploaded yet.
              </div>
            )}
            {documents.map((doc: any) => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Type: {doc.documentType}</p>
                    {doc.rejectionReason && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">Reason: {doc.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${DOC_BADGE[doc.verificationStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {doc.verificationStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                {doc.verificationStatus === 'PENDING_VERIFICATION' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      className="text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                    >
                      Approve
                    </Button>
                    <Button
                      className="text-xs bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        const reason = prompt('Please enter the rejection reason:');
                        if (reason) handleVerifyDocument(doc.id, 'REJECTED', reason);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-xs"
                      onClick={() => {
                        const reason = prompt('Please specify what needs to be resubmitted:');
                        if (reason) handleVerifyDocument(doc.id, 'REQUIRES_RESUBMISSION', reason);
                      }}
                    >
                      Request Resubmission
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            {/* Assign Reviewer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Assign Academic Reviewer</h3>
              <div className="flex space-x-3">
                <select
                  value={selectedReviewer}
                  onChange={e => setSelectedReviewer(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reviewer...</option>
                  {reviewers.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.role})</option>
                  ))}
                </select>
                <Button onClick={handleAssignReviewer}>Assign</Button>
              </div>
            </div>

            {/* Existing Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Submitted Reviews ({reviews.length})</h3>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border dark:border-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[['Academic', review.academicScore], ['Language', review.languageScore], ['Behavior', review.behaviorScore], ['Extracurricular', review.extracurricularScore]].map(([label, score]) => (
                          <div key={label} className="text-center bg-gray-50 dark:bg-gray-900/30 rounded-lg p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{score ?? '-'}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall: {review.overallScore}/100</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${review.recommendation === 'RECOMMEND' ? 'bg-green-100 text-green-700' : review.recommendation === 'REJECT' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {review.recommendation?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {review.comments && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">"{review.comments}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Review */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Submit Review Scores</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  ['academicScore', 'Academic Score (0-100)'],
                  ['languageScore', 'Language Score (0-100)'],
                  ['behaviorScore', 'Behavior Score (0-100)'],
                  ['extracurricularScore', 'Extracurricular Score (0-100)'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={(reviewScores as any)[key]}
                      onChange={e => setReviewScores(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendation</label>
                <select
                  value={reviewRecommendation}
                  onChange={e => setReviewRecommendation(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RECOMMEND">Recommend</option>
                  <option value="RECOMMEND_WITH_CONDITIONS">Recommend with Conditions</option>
                  <option value="WAITLIST">Waitlist</option>
                  <option value="REJECT">Reject</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments</label>
                <textarea
                  value={reviewComments}
                  onChange={e => setReviewComments(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add review notes and observations..."
                />
              </div>
              <Button onClick={handleSubmitReview} isLoading={submitting}>Submit Review</Button>
            </div>
          </div>
        )}

        {/* Decision Tab */}
        {activeTab === 'decision' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Admissions Committee Decision</h3>

            {reviews.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Summary</p>
                <div className="flex space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews: <strong>{reviews.length}</strong></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Score: <strong>{Math.round(reviews.reduce((s, r) => s + (r.overallScore || 0), 0) / reviews.length)}/100</strong>
                  </span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Decision</label>
              <div className="grid grid-cols-3 gap-3">
                {[['ACCEPTED', 'Accept', 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'],
                  ['WAITLISTED', 'Waitlist', 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400'],
                  ['REJECTED', 'Reject', 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'],
                ].map(([value, label, colorClass]) => (
                  <button
                    key={value}
                    onClick={() => setDecision(value)}
                    className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${decision === value ? colorClass + ' border-current' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Decision Reason / Notes</label>
              <textarea
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Document the committee's decision rationale..."
              />
            </div>

            <Button
              onClick={handleSubmitDecision}
              isLoading={submitting}
              className={decision === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' : decision === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Confirm {decision.charAt(0) + decision.slice(1).toLowerCase()} Decision
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
