'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SchoolCrest } from '@/components/SchoolCrest';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/programs', label: 'Programmes' },
  { href: '/fees', label: 'Tuition & Fees' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

const STATS = [
  { value: '500+', label: 'Enrolled Students' },
  { value: '5', label: 'Education Programmes' },
  { value: 'AMS', label: 'Montessori Accredited' },
  { value: '2+', label: 'Curriculum Pathways' },
];

const PILLARS = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Montessori Excellence',
    desc: 'Our AMS-registered Montessori programme challenges students to think independently, explore with curiosity, and develop a genuine love for learning across all stages.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: 'Holistic Learning',
    desc: 'We blend the Rwanda National Curriculum with Montessori principles, nurturing the whole child — academically, socially, and emotionally — from Nursery to Senior 6.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Character & Independence',
    desc: 'We foster self-esteem, integrity, life skills, and mentorship — empowering every student to become a confident, independent adult and positive changemaker.',
  },
];

const PROGRAMMES_PREVIEW = [
  { level: 'Nursery', grades: 'Baby Class – Nursery 3', ages: '2–6', gradient: 'from-amber-400 to-orange-500', emoji: '🌱' },
  { level: 'Primary', grades: 'P1 – P6', ages: '6–13', gradient: 'from-sky-400 to-blue-600', emoji: '📚' },
  { level: 'Junior Secondary', grades: 'S1 – S3', ages: '13–16', gradient: 'from-violet-500 to-purple-700', emoji: '🔬' },
  { level: 'Senior Secondary I', grades: 'S4 – S5', ages: '16–18', gradient: 'from-emerald-400 to-green-700', emoji: '🎓' },
  { level: 'Senior Secondary II', grades: 'S5 – S6', ages: '17–19', gradient: 'from-rose-400 to-red-700', emoji: '🏆' },
];

const STEPS = [
  { step: '01', title: 'Apply Online', desc: 'Complete the digital form in under 30 minutes.', emoji: '✏️' },
  { step: '02', title: 'Upload Documents', desc: 'Submit your birth certificate, transcripts, and ID.', emoji: '📎' },
  { step: '03', title: 'Academic Review', desc: 'Our team evaluates your academic profile.', emoji: '🔍' },
  { step: '04', title: 'Interview', desc: 'Selected candidates attend a friendly interview.', emoji: '🤝' },
  { step: '05', title: 'Decision', desc: 'The committee issues a formal admissions decision.', emoji: '📋' },
  { step: '06', title: 'Enroll', desc: 'Accept your offer and complete your enrolment.', emoji: '🎓' },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePortalAccess = async (type: 'student' | 'admin') => {
    setIsLoading(type);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      const credentials =
        type === 'admin'
          ? { email: 'admin@iseas.com', password: 'admin123' }
          : { email: 'parent@test.com', password: 'password123' };
      const data = await apiFetch('/auth/authenticate', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      router.push(type === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch {
      router.push(type === 'admin' ? '/admin/dashboard' : '/dashboard');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] transition-colors">

      {/* ── Navigation ── */}
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
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-bold bg-[#4DB8E8] text-[#1A1A1A] px-5 py-2 rounded-lg hover:bg-[#7DCEF4] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#E8731A] min-h-[90vh] flex items-center">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute right-0 top-0 w-1/2 h-full opacity-[0.07]" viewBox="0 0 500 700" fill="none">
            <circle cx="400" cy="150" r="250" stroke="#4DB8E8" strokeWidth="1.5" />
            <circle cx="400" cy="150" r="180" stroke="#4DB8E8" strokeWidth="1" />
            <circle cx="400" cy="150" r="110" stroke="#4DB8E8" strokeWidth="0.8" />
            <line x1="0" y1="350" x2="500" y2="350" stroke="#4DB8E8" strokeWidth="0.5" />
            <line x1="250" y1="0" x2="250" y2="700" stroke="#4DB8E8" strokeWidth="0.5" />
            <path d="M0 550 Q250 400 500 550" stroke="#4DB8E8" strokeWidth="0.8" fill="none" />
          </svg>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#4DB8E8] opacity-5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#4DB8E8] text-[11px] font-semibold tracking-[0.18em] uppercase px-4 py-2 rounded-full mb-8">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
  AMS Montessori · Kigali, Rwanda
              </div>
              <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
                In Pursuit<br />
                of a Balanced<br />
                <span className="text-[#4DB8E8] italic">Education</span>
              </h1>
              <p className="text-orange-200 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
                A Montessori and Rwanda National Curriculum school nurturing independent thinkers, creative changemakers, and well-rounded individuals — in the heart of Kigali.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-[#4DB8E8] hover:bg-[#7DCEF4] text-[#1A1A1A] font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
                >
                  Begin Your Application
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/60 transition-all text-sm"
                >
                  Explore Programmes
                </Link>
              </div>
            </div>

            {/* Right: crest + stats */}
            <div className="hidden lg:flex flex-col items-center gap-8">
              <SchoolCrest className="w-44 h-52 drop-shadow-2xl" />
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm"
                  >
                    <div className="font-display text-[#4DB8E8] font-bold text-2xl">{value}</div>
                    <div className="text-orange-300 text-xs mt-0.5 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full block">
            <path
              d="M0 56L1440 56L1440 18C1200 56 800 0 400 36C200 52 100 56 0 56Z"
              className="fill-[#F8F5EE] dark:fill-[#080f0a]"
            />
          </svg>
        </div>
      </section>

      {/* ── Mobile Stats Strip ── */}
      <div className="lg:hidden bg-[#1A1A1A]">
        <div className="max-w-xl mx-auto px-4 py-6 grid grid-cols-2 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-[#4DB8E8] font-bold text-2xl">{value}</div>
              <div className="text-orange-400 text-xs font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why Excella ── */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#4DB8E8] font-semibold text-xs tracking-[0.2em] uppercase mb-3">Why Choose Us</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">An Education Built for the Whole Child</h2>
          <div className="w-16 h-1 bg-[#4DB8E8] mx-auto mt-5 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-800/60 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-14 h-14 bg-[#E8731A]/10 dark:bg-[#E8731A]/30 rounded-xl flex items-center justify-center text-[#E8731A] dark:text-orange-400 mb-5 group-hover:bg-[#E8731A] group-hover:text-white transition-all">
                {icon}
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programmes Preview ── */}
      <section className="bg-gray-50 dark:bg-gray-900/40 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <p className="text-[#4DB8E8] font-semibold text-xs tracking-[0.2em] uppercase mb-3">Academic Pathways</p>
              <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Our Programmes</h2>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1.5 text-[#E8731A] dark:text-orange-400 font-semibold text-sm hover:gap-3 transition-all group"
            >
              View full catalogue
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROGRAMMES_PREVIEW.map(({ level, grades, ages, gradient, emoji }) => (
              <Link
                href="/programs"
                key={level}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-200"
              >
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white min-h-[200px] flex flex-col justify-between`}>
                  <div className="text-4xl mb-4">{emoji}</div>
                  <div>
                    <div className="font-display font-bold text-lg leading-tight mb-1">{level}</div>
                    <div className="text-white/80 text-xs font-medium">{grades}</div>
                    <div className="text-white/60 text-xs mt-0.5">Ages {ages}</div>
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-full p-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admissions Journey ── */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#4DB8E8] font-semibold text-xs tracking-[0.2em] uppercase mb-3">Getting Started</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">The Admissions Journey</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-sm">
            A transparent, supportive process designed to guide every family with confidence from first enquiry to first day of school.
          </p>
          <div className="w-16 h-1 bg-[#4DB8E8] mx-auto mt-5 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STEPS.map(({ step, title, desc, emoji }) => (
            <div
              key={step}
              className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-[#4DB8E8]/30 transition-all text-center group"
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="text-[#4DB8E8] font-bold text-[10px] tracking-[0.15em] uppercase mb-2">Step {step}</div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm mb-2 leading-snug">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#E8731A] hover:bg-[#C55E0E] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm"
          >
            Start Your Application Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Portal Access ── */}
      <section className="bg-[#E8731A] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Access Your Portal</h2>
            <p className="text-orange-200 text-sm">Choose your portal to begin or manage your admissions journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parent Portal */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.15] transition-all group">
              <div className="w-14 h-14 bg-[#4DB8E8]/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#4DB8E8]/30 transition-all">
                <svg className="w-7 h-7 text-[#4DB8E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Parent Portal</h3>
              <p className="text-orange-200 text-sm mb-6 leading-relaxed">
                Apply for admission, upload supporting documents, track your application status in real time, and accept your offer of enrolment.
              </p>
              <button
                onClick={() => handlePortalAccess('student')}
                disabled={!!isLoading}
                className="w-full bg-[#4DB8E8] hover:bg-[#7DCEF4] text-[#1A1A1A] font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                {isLoading === 'student' ? 'Connecting...' : 'Enter Parent Portal →'}
              </button>
            </div>

            {/* Staff Portal */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.15] transition-all group">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-white/30 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Staff Portal</h3>
              <p className="text-orange-200 text-sm mb-6 leading-relaxed">
                Process applications, verify documents, conduct academic reviews, schedule interviews, and manage the end-to-end admissions pipeline.
              </p>
              <button
                onClick={() => handlePortalAccess('admin')}
                disabled={!!isLoading}
                className="w-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                {isLoading === 'admin' ? 'Connecting...' : 'Enter Staff Portal →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <SchoolCrest className="h-14 w-12" />
              <div>
                <div className="font-bold text-base tracking-wider uppercase">Excella</div>
                <div className="text-[#4DB8E8] text-[10px] tracking-[0.22em] uppercase font-medium">International School</div>
                <div className="text-orange-500 text-xs mt-1">Kigali, Rwanda</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-orange-300">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-white transition-colors text-[#4DB8E8] hover:text-[#7DCEF4]">Apply Now</Link>
            </div>
          </div>
          <div className="pt-6 text-center text-orange-600 text-xs">
            © {new Date().getFullYear()} Excella International School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
