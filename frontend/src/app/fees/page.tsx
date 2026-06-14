'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const FEE_SCHEDULE = [
  {
    level: 'Early Years (Nursery – Primary 2)',
    annual: 2100000,
    termly: 700000,
    registration: 150000,
    notes: 'Includes all learning materials, school diary, and one school uniform set.',
  },
  {
    level: 'Primary (Primary 3 – Primary 6)',
    annual: 2550000,
    termly: 850000,
    registration: 150000,
    notes: 'Includes all textbooks and Cambridge Primary Checkpoint examination fees.',
  },
  {
    level: 'Lower Secondary (Senior 1 – Senior 3)',
    annual: 3000000,
    termly: 1000000,
    registration: 200000,
    notes: 'Includes Cambridge Lower Secondary Checkpoint assessment fees.',
  },
  {
    level: 'IGCSE (Senior 4 – Senior 5)',
    annual: 3600000,
    termly: 1200000,
    registration: 200000,
    notes: 'Includes Cambridge IGCSE examination registration fees.',
  },
  {
    level: 'Advanced Level (Senior 5 – Senior 6)',
    annual: 4200000,
    termly: 1400000,
    registration: 200000,
    notes: 'Includes Cambridge A-Level examination registration fees and university application guidance.',
  },
];

const ADDITIONAL_FEES = [
  { item: 'Application Processing Fee', amount: 50000, notes: 'Non-refundable, due at time of application' },
  { item: 'Enrollment Confirmation Deposit', amount: 500000, notes: 'Refundable and applied to first term fees on enrollment' },
  { item: 'School Bus (Per Term)', amount: 150000, notes: 'Optional — varies by route distance within Kigali' },
  { item: 'After-School Care (Per Term)', amount: 120000, notes: 'Optional — Mon–Fri, 15:30–18:00' },
  { item: 'School Lunch (Per Term)', amount: 100000, notes: 'Optional — hot lunch served daily' },
  { item: 'Extra-Curricular Activities (Per Term)', amount: 50000, notes: 'Optional — wide range of clubs and sports' },
];

function rwf(amount: number) {
  return 'RWF ' + amount.toLocaleString('en-RW');
}

export default function FeesPage() {
  const [view, setView] = useState<'annual' | 'termly'>('annual');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Nav */}
      <nav className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="font-extrabold text-lg tracking-tight hover:text-blue-200 transition-colors">iga afriqa</Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-blue-200">
          <Link href="/programs" className="hover:text-white transition-colors">Programmes</Link>
          <Link href="/fees" className="text-white font-semibold">Tuition & Fees</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-semibold bg-white text-blue-900 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Tuition & Fees</h1>
        <p className="text-blue-200 max-w-2xl mx-auto text-lg">
          Transparent, all-inclusive fee structures for the {new Date().getFullYear()}/{new Date().getFullYear() + 1} academic year.
          All fees are quoted in Rwandan Francs (RWF).
        </p>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setView('annual')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${view === 'annual' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Annual Fees
            </button>
            <button
              onClick={() => setView('termly')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${view === 'termly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Per Term
            </button>
          </div>
        </div>

        {/* Main Fee Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <h2 className="font-bold text-gray-900 dark:text-white">School Fee Schedule — {new Date().getFullYear()}/{new Date().getFullYear() + 1}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">The school year comprises three terms of approximately 13 weeks each.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Programme Level</th>
                  <th className="px-6 py-3 text-right font-bold">Tuition ({view === 'annual' ? 'Annual' : 'Per Term'})</th>
                  <th className="px-6 py-3 text-right font-bold">Registration Fee</th>
                  <th className="px-6 py-3 text-left font-bold">Includes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {FEE_SCHEDULE.map((row, i) => (
                  <tr key={row.level} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/20'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.level}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-blue-700 dark:text-blue-400">
                      {rwf(view === 'annual' ? row.annual : row.termly)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700 dark:text-gray-300">{rwf(row.registration)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional / Optional Fees */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <h2 className="font-bold text-gray-900 dark:text-white">Additional & Optional Fees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Item</th>
                  <th className="px-6 py-3 text-right font-bold">Amount (RWF)</th>
                  <th className="px-6 py-3 text-left font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {ADDITIONAL_FEES.map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/20'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.item}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700 dark:text-gray-300">{rwf(row.amount)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Schedule</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0" />Term 1 fees due: 2 weeks before term start (mid-January)</li>
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0" />Term 2 fees due: last week of Term 1 (late April)</li>
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0" />Term 3 fees due: last week of Term 2 (late August)</li>
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0" />Annual payment (paid by Term 1 due date) receives a 3% discount</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Accepted Payment Methods</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 mr-2 shrink-0" />MTN Mobile Money (MoMo)</li>
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2 shrink-0" />Airtel Money</li>
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2 shrink-0" />Bank Transfer (RWF — BK, Equity, I&M, Cogebanque)</li>
              <li className="flex items-start"><span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0" />Visa / Mastercard debit or credit card</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5 text-sm text-amber-800 dark:text-amber-300">
          <strong>Financial Aid & Scholarships:</strong> Limited merit-based scholarships and need-based bursaries are available for qualifying applicants. Please contact the Admissions Office at{' '}
          <Link href="/contact" className="underline hover:text-amber-900 dark:hover:text-amber-200">admissions@iseas.com</Link> for details.
        </div>
      </div>
    </div>
  );
}
