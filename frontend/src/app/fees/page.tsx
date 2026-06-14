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
    notes: 'Includes all textbooks and national curriculum assessment fees.',
  },
  {
    level: 'Junior Secondary (Senior 1 – Senior 3)',
    annual: 3000000,
    termly: 1000000,
    registration: 200000,
    notes: 'Includes national curriculum assessment and Montessori enrichment programme fees.',
  },
  {
    level: 'Senior Secondary I (Senior 4 – Senior 5)',
    annual: 3600000,
    termly: 1200000,
    registration: 200000,
    notes: 'Includes national O-Level examination registration fees.',
  },
  {
    level: 'Senior Secondary II (Senior 5 – Senior 6)',
    annual: 4200000,
    termly: 1400000,
    registration: 200000,
    notes: 'Includes national A-Level examination registration fees and university application guidance.',
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
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] transition-colors">
      {/* Nav */}
      <nav className="bg-[#E8731A] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <Link href="/" className="font-display font-bold text-lg tracking-tight hover:text-orange-200 transition-colors">
          Excella
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-orange-200">
          <Link href="/programs" className="hover:text-white transition-colors">Programmes</Link>
          <Link href="/fees" className="text-white font-semibold">Tuition & Fees</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
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
        <h1 className="font-display text-4xl font-bold mb-3">Tuition & Fees</h1>
        <p className="text-orange-200 max-w-2xl mx-auto text-base">
          Transparent, all-inclusive fee structures for the {new Date().getFullYear()}/{new Date().getFullYear() + 1} academic year.
          All fees are quoted in Rwandan Francs (RWF).
        </p>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 inline-flex shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setView('annual')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'annual' ? 'bg-[#E8731A] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Annual Fees
            </button>
            <button
              onClick={() => setView('termly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'termly' ? 'bg-[#E8731A] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Per Term
            </button>
          </div>
        </div>

        {/* Main Fee Table */}
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[#F8F5EE] dark:bg-gray-900/40">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">
              School Fee Schedule — {new Date().getFullYear()}/{new Date().getFullYear() + 1}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">The school year comprises three terms of approximately 13 weeks each.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F8F5EE] dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">Programme Level</th>
                  <th className="px-6 py-3 text-right font-semibold tracking-wide">Tuition ({view === 'annual' ? 'Annual' : 'Per Term'})</th>
                  <th className="px-6 py-3 text-right font-semibold tracking-wide">Registration Fee</th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">Includes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {FEE_SCHEDULE.map((row) => (
                  <tr key={row.level} className="hover:bg-[#F8F5EE]/60 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.level}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-[#E8731A] dark:text-green-400">
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
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[#F8F5EE] dark:bg-gray-900/40">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">Additional & Optional Fees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F8F5EE] dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">Item</th>
                  <th className="px-6 py-3 text-right font-semibold tracking-wide">Amount (RWF)</th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {ADDITIONAL_FEES.map((row) => (
                  <tr key={row.item} className="hover:bg-[#F8F5EE]/60 dark:hover:bg-gray-700/20 transition-colors">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">Payment Schedule</h3>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
              {[
                'Term 1 fees due: 2 weeks before term start (mid-January)',
                'Term 2 fees due: last week of Term 1 (late April)',
                'Term 3 fees due: last week of Term 2 (late August)',
                'Annual payment (paid by Term 1 due date) receives a 3% discount',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8731A] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">Accepted Payment Methods</h3>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
              {[
                { dot: 'bg-yellow-500', text: 'MTN Mobile Money (MoMo)' },
                { dot: 'bg-red-500',    text: 'Airtel Money' },
                { dot: 'bg-[#E8731A]', text: 'Bank Transfer (RWF — BK, Equity, I&M, Cogebanque)' },
                { dot: 'bg-[#4DB8E8]', text: 'Visa / Mastercard debit or credit card' },
              ].map(({ dot, text }) => (
                <li key={text} className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scholarships Banner */}
        <div className="bg-[#E8731A]/8 dark:bg-green-900/20 border border-[#E8731A]/20 dark:border-green-800 rounded-2xl p-5 text-sm text-[#E8731A] dark:text-green-300">
          <strong className="font-semibold">Financial Aid & Scholarships:</strong>{' '}
          Limited merit-based scholarships and need-based bursaries are available for qualifying applicants. Please contact the Admissions Office at{' '}
          <Link href="/contact" className="underline hover:text-[#1A1A1A] dark:hover:text-orange-200">info@excellaschool.rw</Link> for details.
        </div>
      </div>
    </div>
  );
}
