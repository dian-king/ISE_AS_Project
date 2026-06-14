'use client';

import React from 'react';
import Link from 'next/link';
import { SchoolCrest } from '@/components/SchoolCrest';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_LINKS = [
  { href: '/programs', label: 'Programmes', active: true },
  { href: '/fees', label: 'Tuition & Fees' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

const PROGRAMMES = [
  {
    level: 'Early Years',
    grades: 'Nursery – Grade 2',
    ages: 'Ages 3–7',
    curriculum: 'Montessori Nursery',
    emoji: '🌱',
    accent: '#F59E0B',
    accentBg: 'bg-amber-50 dark:bg-amber-900/10',
    accentBorder: 'border-amber-200 dark:border-amber-800',
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    description:
      'A nurturing Montessori environment that builds foundational literacy, numeracy, and social skills. Children learn through self-directed exploration with hands-on materials, guided by teachers who act as facilitators of discovery.',
    highlights: [
      'American Montessori Society (AMS) registered',
      'Self-directed, hands-on learning materials',
      'Outdoor learning and nature play',
      'Mixed-age groupings fostering independence',
    ],
  },
  {
    level: 'Primary',
    grades: 'Grade 3 – Grade 6',
    ages: 'Ages 7–11',
    curriculum: 'Montessori Primary',
    emoji: '📚',
    accent: '#3B82F6',
    accentBg: 'bg-blue-50 dark:bg-blue-900/10',
    accentBorder: 'border-blue-200 dark:border-blue-800',
    accentText: 'text-blue-700 dark:text-blue-400',
    accentBadge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    description:
      'A rigorous Montessori programme developing strong foundations in English, Mathematics, and Sciences. Students build critical thinking and collaborative skills through self-directed inquiry and hands-on project work.',
    highlights: [
      'Montessori-based inquiry learning',
      'STEM integration and coding',
      'Arts, drama, and music programme',
      'Competitive sports and PE',
    ],
  },
  {
    level: 'Lower Secondary',
    grades: 'Grade 7 – Grade 9',
    ages: 'Ages 11–14',
    curriculum: 'National Curriculum',
    emoji: '🔬',
    accent: '#8B5CF6',
    accentBg: 'bg-violet-50 dark:bg-violet-900/10',
    accentBorder: 'border-violet-200 dark:border-violet-800',
    accentText: 'text-violet-700 dark:text-violet-400',
    accentBadge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    description:
      'An intellectually stimulating programme following the Rwanda National Curriculum with Montessori-informed teaching methods. Subjects include English, Mathematics, Sciences, History, Geography, ICT, and modern languages.',
    highlights: [
      'Rwanda National Curriculum',
      'Second language: French or Kinyarwanda',
      'Student leadership council',
      'Community service programme',
    ],
  },
  {
    level: 'IGCSE',
    grades: 'Grade 10 – Grade 11',
    ages: 'Ages 14–16',
    curriculum: 'National O-Level',
    emoji: '🎓',
    accent: '#10B981',
    accentBg: 'bg-emerald-50 dark:bg-emerald-900/10',
    accentBorder: 'border-emerald-200 dark:border-emerald-800',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    description:
      'The Rwanda National O-Level programme preparing students for national examinations and university entry. Students build a well-rounded academic profile across core and elective subjects aligned with their ambitions.',
    highlights: [
      'Rwanda National O-Level examinations',
      'Broad subject selection',
      'Montessori-informed project learning',
      'University entrance preparation',
    ],
  },
  {
    level: 'A-Level',
    grades: 'Grade 12 – Grade 13',
    ages: 'Ages 16–18',
    curriculum: 'National A-Level',
    emoji: '🏆',
    accent: '#EF4444',
    accentBg: 'bg-rose-50 dark:bg-rose-900/10',
    accentBorder: 'border-rose-200 dark:border-rose-800',
    accentText: 'text-rose-700 dark:text-rose-400',
    accentBadge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    description:
      'The Rwanda National A-Level programme offering deep subject specialisation and the critical academic skills required for admission to leading universities locally and globally.',
    highlights: [
      'Rwanda National A-Level examinations',
      'Subject specialisation in 3 subjects',
      'University application guidance',
      'Research and independent study projects',
    ],
  },
];

export default function ProgrammesPage() {
  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] transition-colors">

      {/* Navigation */}
      <nav className="bg-[#E8731A] sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px]">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <SchoolCrest className="h-10 w-9" />
              <div className="hidden sm:block leading-tight">
                <div className="text-white font-bold text-sm tracking-wider uppercase">Excella</div>
                <div className="text-[#4DB8E8] text-[10px] font-medium tracking-[0.22em] uppercase">International School</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-orange-200">
              {NAV_LINKS.map(({ href, label, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={active ? 'text-white font-semibold border-b-2 border-[#4DB8E8] pb-0.5' : 'hover:text-white transition-colors'}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login" className="hidden sm:inline-block text-sm font-bold bg-[#4DB8E8] text-[#1A1A1A] px-5 py-2 rounded-lg hover:bg-[#7DCEF4] transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative bg-[#E8731A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="absolute right-0 top-0 h-full w-1/3" viewBox="0 0 300 400" fill="none">
            <circle cx="250" cy="100" r="180" stroke="#4DB8E8" strokeWidth="1" />
            <circle cx="250" cy="100" r="110" stroke="#4DB8E8" strokeWidth="0.8" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
          <div className="max-w-2xl">
            <p className="text-[#4DB8E8] font-semibold text-xs tracking-[0.2em] uppercase mb-4">Academic Pathways</p>
            <h1 className="font-display text-5xl font-bold text-white mb-4 leading-tight">Programme Catalogue</h1>
            <p className="text-orange-200 text-lg leading-relaxed mb-8">
              From Nursery through Senior 6 — a complete Montessori and National Curriculum pathway designed to nurture independent, well-rounded learners ready for life.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#4DB8E8] hover:bg-[#7DCEF4] text-[#1A1A1A] font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-sm"
            >
              Apply Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full block">
            <path d="M0 40L1440 40L1440 12C1100 40 700 0 300 28C150 38 60 40 0 40Z" className="fill-[#F8F5EE] dark:fill-[#080f0a]" />
          </svg>
        </div>
      </div>

      {/* Programme Cards */}
      <div className="max-w-5xl mx-auto py-20 px-4 sm:px-6 space-y-8">
        {PROGRAMMES.map((prog) => (
          <div
            key={prog.level}
            className={`rounded-2xl border-2 p-8 ${prog.accentBg} ${prog.accentBorder} hover:shadow-md transition-shadow`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-5">
              <div className="flex items-start gap-4">
                <div className="text-4xl mt-1">{prog.emoji}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className={`font-display text-2xl font-bold text-gray-900 dark:text-white`}>{prog.level}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prog.accentBadge}`}>
                      {prog.curriculum}
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${prog.accentText}`}>
                    {prog.grades} &middot; {prog.ages}
                  </p>
                </div>
              </div>
              <Link
                href="/register"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-bold bg-[#E8731A] text-white px-5 py-2.5 rounded-xl hover:bg-[#155D38] transition-colors"
              >
                Apply for this Programme
              </Link>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">{prog.description}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prog.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <svg className={`w-4 h-4 shrink-0 mt-0.5 ${prog.accentText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Requirements note */}
        <div className="bg-[#E8731A]/5 dark:bg-[#E8731A]/20 border border-[#E8731A]/20 dark:border-green-800 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#E8731A]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-[#E8731A] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">Admissions Requirements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Document requirements vary by programme and grade level. After submitting your application you will be guided through the specific requirements for your chosen programme.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                General requirements include: Birth Certificate, Passport or National ID, most recent academic transcripts, and at least one teacher reference letter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-[#E8731A] py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-3">Ready to Apply?</h2>
          <p className="text-orange-200 mb-8">Start your application today. The process takes less than 30 minutes to complete.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#4DB8E8] hover:bg-[#7DCEF4] text-[#1A1A1A] font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-sm"
          >
            Begin Application
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
