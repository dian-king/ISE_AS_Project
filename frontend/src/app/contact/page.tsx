'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { API_BASE_URL } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    childName: '',
    gradeOfInterest: '',
    academicYear: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/public/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8731A] dark:focus:ring-orange-500 focus:border-transparent transition-shadow";

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] transition-colors">
      {/* Nav */}
      <nav className="bg-[#E8731A] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <Link href="/" className="font-display font-bold text-lg tracking-tight hover:text-green-200 transition-colors">
          Excella
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-orange-200">
          <Link href="/programs" className="hover:text-white transition-colors">Programmes</Link>
          <Link href="/fees" className="hover:text-white transition-colors">Tuition & Fees</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/contact" className="text-white font-semibold">Contact</Link>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-semibold bg-[#4DB8E8] text-[#1A1A1A] px-4 py-1.5 rounded-lg hover:bg-[#7DCEF4] transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#E8731A] text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none" aria-hidden>
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full border-4 border-white" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border-4 border-white" />
        </div>
        <p className="text-[#4DB8E8] font-semibold text-sm uppercase tracking-widest mb-2">Excella International School</p>
        <h1 className="font-display text-4xl font-bold mb-3">Contact Admissions</h1>
        <p className="text-green-200 max-w-xl mx-auto">
          Submit an inquiry and our admissions team will respond within one business day.
        </p>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Admissions Office</h2>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#E8731A] dark:text-orange-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>KG 103 St, Kimironko, Gasabo<br />Kigali, Rwanda</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#E8731A] dark:text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@excellaschool.rw</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#E8731A] dark:text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+250 788 306 085</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="font-display font-bold text-gray-900 dark:text-white mb-3">Office Hours</h2>
              <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between"><span>Monday – Friday</span><span className="font-semibold text-gray-900 dark:text-white">08:00 – 16:00</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="text-gray-400">Closed</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="text-gray-400">Closed</span></div>
              </div>
            </div>

            <div className="bg-[#E8731A] rounded-2xl p-5 text-white text-sm shadow-sm">
              <p className="font-display font-bold mb-1">Ready to apply?</p>
              <p className="text-green-200 mb-4 text-xs leading-relaxed">Skip the inquiry and start your application directly online.</p>
              <Link href="/register" className="bg-[#4DB8E8] text-[#1A1A1A] font-semibold px-4 py-2 rounded-xl hover:bg-[#7DCEF4] transition-colors inline-block text-sm">
                Apply Now
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-[#E8731A]/10 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-[#E8731A] dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Inquiry Received</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
                  Thank you, <strong className="text-gray-700 dark:text-gray-200">{form.firstName}</strong>. A member of our admissions team will contact you at{' '}
                  <strong className="text-gray-700 dark:text-gray-200">{form.email}</strong> within one business day.
                </p>
                <Link href="/register" className="bg-[#E8731A] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0a3d26] transition-colors inline-block">
                  Start Your Application
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-6">Send an Inquiry</h2>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name <span className="text-red-400">*</span></label>
                      <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name <span className="text-red-400">*</span></label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Child's Full Name <span className="text-red-400">*</span></label>
                    <input name="childName" value={form.childName} onChange={handleChange} required className={inputClass} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Grade of Interest <span className="text-red-400">*</span></label>
                      <select name="gradeOfInterest" value={form.gradeOfInterest} onChange={handleChange} required className={inputClass}>
                        <option value="">Select grade…</option>
                        {['Nursery', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
                          'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Academic Year <span className="text-red-400">*</span></label>
                      <select name="academicYear" value={form.academicYear} onChange={handleChange} required className={inputClass}>
                        <option value="">Select year…</option>
                        <option value="2026/2027">2026/2027</option>
                        <option value="2027/2028">2027/2028</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message / Questions</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                      placeholder="Tell us about your child, any specific questions, or how we can help…"
                      className={inputClass + ' resize-none'} />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#E8731A] text-white font-semibold py-3 rounded-xl hover:bg-[#0a3d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending…
                      </>
                    ) : 'Send Inquiry'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
