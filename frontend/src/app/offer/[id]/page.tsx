'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function OfferPage() {
  const { id } = useParams(); // application ID
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appData, offerData] = await Promise.all([
          apiFetch(`/applications/${id}`),
          apiFetch(`/offers/${id}`),
        ]);
        setApplication(appData);
        setOffer(offerData);
      } catch (err: any) {
        setError(err.message || 'Failed to load offer details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this offer? This action cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/offers/${offer.id}/accept`, { method: 'POST' });
      alert('Congratulations! Your offer has been accepted. You will receive enrollment instructions shortly.');
      router.push('/dashboard');
    } catch (err: any) {
      alert('Failed to accept offer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this offer? This action cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/offers/${offer.id}/decline`, { method: 'POST' });
      alert('Your offer has been declined. We hope to see you again in the future.');
      router.push('/dashboard');
    } catch (err: any) {
      alert('Failed to decline offer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading offer details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const isExpired = offer?.expiryDate && new Date(offer.expiryDate) < new Date();
  const isPending = offer?.offerStatus === 'PENDING';

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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-8 py-10 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1">Congratulations!</h1>
            <p className="text-green-100">You have received an offer of admission</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {application && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {application.applicantFirstName} {application.applicantLastName}
                </h2>
                <dl className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">Programme / Grade</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{application.gradeApplyingFor}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">Academic Year</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{application.academicYear}</dd>
                  </div>
                  {offer?.offerNumber && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Offer Reference</dt>
                      <dd className="text-gray-900 dark:text-white font-mono">{offer.offerNumber}</dd>
                    </div>
                  )}
                  {offer?.expiryDate && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Offer Expires</dt>
                      <dd className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {new Date(offer.expiryDate).toLocaleDateString()}
                        {isExpired && ' (Expired)'}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {offer?.offerStatus === 'ACCEPTED' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm text-center">
                You have already accepted this offer. The enrollment team will contact you shortly.
              </div>
            )}

            {offer?.offerStatus === 'DECLINED' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm text-center">
                You have declined this offer.
              </div>
            )}

            {isPending && !isExpired && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  Please review the offer details above and respond before the expiry date.
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                  onClick={handleAccept}
                  isLoading={isSubmitting}
                >
                  Accept Offer
                </Button>
                <Button
                  variant="secondary"
                  className="w-full py-3 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                  onClick={handleDecline}
                  disabled={isSubmitting}
                >
                  Decline Offer
                </Button>
              </div>
            )}

            {isExpired && isPending && (
              <div className="text-center text-sm text-red-600 dark:text-red-400">
                This offer has expired. Please contact the admissions office if you still wish to enroll.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
