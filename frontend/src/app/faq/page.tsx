'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const FAQ_ITEMS = [
  {
    category: 'Admissions Process',
    questions: [
      {
        q: 'How do I apply for admission?',
        a: 'Applications are completed entirely online through the iga afriqa Parent Portal. Click "Apply Now" on the home page to create a parent account and begin your application. The process is straightforward and typically takes 20–30 minutes to complete.',
      },
      {
        q: 'What is the deadline for applications?',
        a: 'For the 2026/2027 academic year, the priority application deadline is 31 January 2026. Applications received after this date are considered on a rolling basis subject to available places. We strongly recommend applying early as popular grade levels fill quickly.',
      },
      {
        q: 'Can I apply for more than one programme?',
        a: 'Each application is specific to one grade level and academic year. If you wish to apply for multiple children or multiple programmes, you may submit separate applications through the same parent account.',
      },
      {
        q: 'How long does the admissions process take?',
        a: 'From submission to decision, the standard admissions timeline is 4–6 weeks. This includes document verification, academic review, and for some grade levels, an admissions interview. You will receive timely updates at every stage through the Parent Portal and by email.',
      },
      {
        q: 'Is an interview required?',
        a: 'Interviews are required for applicants applying to Grade 7 and above. For Early Years and Primary applicants, an informal school visit may be arranged at the discretion of the Admissions Office. You will be notified through the portal if an interview is required.',
      },
    ],
  },
  {
    category: 'Documents',
    questions: [
      {
        q: 'What documents are required for admission?',
        a: 'Document requirements vary by grade level. In general, you will need: a valid Rwandan National ID (Indangamuntu — 16-digit) or Passport, most recent school report cards or academic transcripts, a Birth Certificate, at least one teacher recommendation letter, and a completed medical information form. Applicants with a National Exam background should also provide their National Exam Index Number. The system will display the exact requirements for your chosen grade level during the application process.',
      },
      {
        q: 'In what format should I upload documents?',
        a: 'All documents must be uploaded in PDF, JPG, JPEG, or PNG format. Individual file size must not exceed 10 MB. Please ensure documents are clearly legible before uploading.',
      },
      {
        q: 'What if a document is rejected?',
        a: 'If a document is rejected by the Admissions Office, you will receive a notification explaining the reason. You may then upload a corrected or clearer version directly through the Parent Portal. The document will return to the verification queue for review.',
      },
      {
        q: 'Do I need certified copies of documents?',
        a: 'Scanned copies are accepted at the application stage. If your application proceeds to enrollment, certified or notarised copies of key documents may be required. The Admissions Office will inform you of any additional certification requirements at that stage.',
      },
    ],
  },
  {
    category: 'Fees & Payments',
    questions: [
      {
        q: 'Is there a non-refundable application fee?',
        a: 'Yes. A non-refundable Application Processing Fee of RWF 50,000 is due at the time of application submission. This fee covers the cost of application review and processing. Payment can be made via MTN MoMo, Airtel Money, or bank transfer.',
      },
      {
        q: 'When do I pay the enrollment deposit?',
        a: 'The Enrollment Confirmation Deposit of RWF 500,000 is due within 14 days of accepting your offer of admission. This deposit is fully refundable and is credited toward your first term tuition fees.',
      },
      {
        q: 'Do you offer financial aid or scholarships?',
        a: 'A limited number of merit-based scholarships and need-based bursaries are available, with priority given to applicants from Ubudehe categories A and B. Please contact the Admissions Office directly to enquire about current availability. Scholarship applications are considered separately from the standard admissions process.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'All fees are quoted and payable in Rwandan Francs (RWF). The school accepts MTN Mobile Money (MoMo), Airtel Money, bank transfer (BK, Equity, I&M, Cogebanque), and Visa/Mastercard debit or credit cards.',
      },
    ],
  },
  {
    category: 'School Life',
    questions: [
      {
        q: 'What curriculum does the school follow?',
        a: 'The school follows the Cambridge International Curriculum from Early Years through A-Level. Cambridge qualifications are recognised by leading universities and employers around the world.',
      },
      {
        q: 'What languages are taught at the school?',
        a: 'The primary medium of instruction is English. French is offered as a second language from Early Years through Grade 9. Kinyarwanda is offered as an additional language option.',
      },
      {
        q: 'What extra-curricular activities are available?',
        a: 'The school offers a rich programme of extra-curricular activities including sports (football, basketball, swimming, athletics), performing arts, debate, robotics, community service, and a range of academic clubs. Many activities are included in the school fees; specialist programmes may carry an additional optional fee.',
      },
      {
        q: 'Does the school provide transport?',
        a: 'Yes. The school operates a fleet of air-conditioned buses covering major residential areas in Kigali. Bus fees are charged per term and vary by route. Contact the Admissions Office for the current route schedule and pricing.',
      },
    ],
  },
];

function FAQAccordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-center justify-between gap-4"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Nav */}
      <nav className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="font-extrabold text-lg tracking-tight hover:text-blue-200 transition-colors">iga afriqa</Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-blue-200">
          <Link href="/programs" className="hover:text-white transition-colors">Programmes</Link>
          <Link href="/fees" className="hover:text-white transition-colors">Tuition & Fees</Link>
          <Link href="/faq" className="text-white font-semibold">FAQ</Link>
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
        <h1 className="text-4xl font-extrabold mb-3">Frequently Asked Questions</h1>
        <p className="text-blue-200 max-w-xl mx-auto">
          Answers to the most common questions from prospective families. Can't find what you're looking for?{' '}
          <Link href="/contact" className="text-white underline">Contact us directly.</Link>
        </p>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-4">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category} className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
              {section.category}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 px-6">
              {section.questions.map(({ q, a }) => (
                <FAQAccordion key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-8">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Our admissions team is happy to help. Reach out to us directly and we will respond within one business day.
          </p>
          <Link href="/contact" className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-block">
            Contact Admissions
          </Link>
        </div>
      </div>
    </div>
  );
}
