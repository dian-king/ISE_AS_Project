'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

type EnrollmentStatus = 'PENDING_FORM' | 'FORM_SUBMITTED' | 'UNDER_REVIEW' | 'ENROLLED';

interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalNotes?: string;
  transportRequired?: boolean;
  uniformSize?: string;
  preferredLanguage?: string;
  additionalNotes?: string;
}

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING_FORM: 'Awaiting Form Submission',
  FORM_SUBMITTED: 'Form Submitted — Awaiting Review',
  UNDER_REVIEW: 'Under Registrar Review',
  ENROLLED: 'Enrollment Complete',
};

const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  PENDING_FORM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  FORM_SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  UNDER_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ENROLLED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export default function EnrollmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const offerId = searchParams.get('offerId');
  const enrollmentId = searchParams.get('enrollmentId');

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalNotes: '',
    transportRequired: false,
    uniformSize: '',
    preferredLanguage: 'English',
    additionalNotes: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (enrollmentId) {
          const data = await apiFetch(`/enrollments/${enrollmentId}`);
          setEnrollment(data);
          // Pre-fill form with existing data
          setForm({
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
            emergencyContactRelationship: data.emergencyContactRelationship || '',
            medicalNotes: data.medicalNotes || '',
            transportRequired: data.transportRequired || false,
            uniformSize: data.uniformSize || '',
            preferredLanguage: data.preferredLanguage || 'English',
            additionalNotes: data.additionalNotes || '',
          });
        } else if (offerId) {
          // Start enrollment from offer
          const data = await apiFetch(`/enrollments/start/${offerId}`, { method: 'POST' });
          setEnrollment(data);
        } else {
          setError('No offer or enrollment ID provided. Please access this page from your dashboard.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load enrollment information.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [offerId, enrollmentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;
    setIsSubmitting(true);
    setError('');
    try {
      const updated = await apiFetch(`/enrollments/${enrollment.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEnrollment(updated);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit enrollment form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (enrollment?.status === 'ENROLLED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enrollment Complete</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The enrollment has been finalised. You will receive a confirmation email with the student number shortly.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Form</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Please complete the form below to finalise your child's enrollment.
          </p>
          {enrollment && (
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[enrollment.status]}`}>
              {STATUS_LABELS[enrollment.status]}
            </span>
          )}
        </div>

        {success ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Form Submitted</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your enrollment form has been received. The registrar will review it and you will be notified once the enrollment is confirmed.
            </p>
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 text-red-700 dark:text-red-300 text-sm rounded">
                {error}
              </div>
            )}

            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" name="emergencyContactName" value={form.emergencyContactName}
                  onChange={handleChange} required />
                <Input label="Phone Number" name="emergencyContactPhone" value={form.emergencyContactPhone}
                  onChange={handleChange} placeholder="+250 7XX XXX XXX" required />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship to Student
                  </label>
                  <select name="emergencyContactRelationship" value={form.emergencyContactRelationship}
                    onChange={handleChange} required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select relationship</option>
                    <option>Parent</option>
                    <option>Guardian</option>
                    <option>Aunt / Uncle</option>
                    <option>Grandparent</option>
                    <option>Sibling</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                Medical Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Medical Notes <span className="text-gray-400">(allergies, conditions, medications — leave blank if none)</span>
                </label>
                <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                School Logistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Language of Instruction</label>
                  <select name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>French</option>
                    <option>Kinyarwanda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uniform Size</label>
                  <select name="uniformSize" value={form.uniformSize} onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select size</option>
                    <option>XS</option><option>S</option><option>M</option>
                    <option>L</option><option>XL</option><option>XXL</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="transport" name="transportRequired"
                    checked={form.transportRequired} onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <label htmlFor="transport" className="text-sm text-gray-700 dark:text-gray-300">
                    School transport required (bus service)
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                Additional Notes
              </h3>
              <textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} rows={3}
                placeholder="Any other information the school should know..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </section>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="secondary" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Submit Enrollment Form
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
