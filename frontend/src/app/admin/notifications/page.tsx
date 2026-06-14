'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  status: string;
  recipientEmail?: string;
  recipientName?: string;
  createdAt: string;
  sentAt?: string | null;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  body: string;
  active: boolean;
}

const TYPE_STYLES: Record<string, string> = {
  INFO:     'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  SUCCESS:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  WARNING:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  ERROR:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  REMINDER: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const STATUS_STYLES: Record<string, string> = {
  SENT:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  FAILED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  QUEUED:  'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
};

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  EMAIL: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  SMS: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
};

function formatDate(s: string | null | undefined) {
  if (!s) return '—';
  return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<'history' | 'templates'>('history');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        if (tab === 'history') {
          const data = await apiFetch('/notifications');
          setNotifications(Array.isArray(data) ? data : data.content ?? []);
        } else {
          const data = await apiFetch('/notifications/templates');
          setTemplates(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tab]);

  const filteredNotifs = notifications.filter(n => {
    const q = search.toLowerCase();
    return !q
      || n.title?.toLowerCase().includes(q)
      || n.recipientEmail?.toLowerCase().includes(q)
      || n.recipientName?.toLowerCase().includes(q)
      || n.type?.toLowerCase().includes(q);
  });

  const filteredTemplates = templates.filter(t => {
    const q = search.toLowerCase();
    return !q || t.name?.toLowerCase().includes(q) || t.type?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-[#0D4A2F] dark:text-green-400 hover:underline text-sm flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Email and SMS communications sent to applicants and parents</p>
            </div>
            <div className="flex gap-2 items-center bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-48"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl p-1 w-fit mb-6 shadow-sm">
          {(['history', 'templates'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(''); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-[#0D4A2F] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-32 gap-3 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </div>
        ) : tab === 'history' ? (
          filteredNotifs.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 rounded-full bg-[#0D4A2F]/10 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0D4A2F] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="font-display text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {search ? 'No matching notifications' : 'No notifications sent yet'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Notifications appear here after they are sent to applicants or parents.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{filteredNotifs.length} notification{filteredNotifs.length !== 1 ? 's' : ''}</p>
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 bg-[#F8F5EE] dark:bg-gray-900/40">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recipient</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Channel</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {filteredNotifs.map(n => (
                        <tr key={n.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{n.message}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-gray-700 dark:text-gray-300">{n.recipientName ?? '—'}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{n.recipientEmail ?? ''}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLES[n.type] ?? 'bg-gray-100 text-gray-600'}`}>
                              {n.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-xs font-medium">
                              {CHANNEL_ICON[n.channel] ?? null}
                              {n.channel}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[n.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {n.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{formatDate(n.sentAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        ) : (
          /* Templates tab */
          filteredTemplates.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="font-display text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {search ? 'No matching templates' : 'No templates configured'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Notification templates define the messages sent during each stage of the admissions process.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map(t => (
                <div key={t.id} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                      {t.subject && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Subject: {t.subject}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">{t.type}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {t.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-mono bg-gray-50 dark:bg-gray-900/40 rounded-lg px-3 py-2">{t.body}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
