'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  performedAt: string;
  oldValue?: string;
  newValue?: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const ACTION_STYLE: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  VIEW:   'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  LOGIN:  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  LOGOUT: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  EXPORT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

function actionCategory(action: string) {
  for (const key of Object.keys(ACTION_STYLE)) {
    if (action.toUpperCase().startsWith(key)) return key;
  }
  return 'VIEW';
}

function formatDate(s: string) {
  return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const PAGE_SIZE = 50;

export default function AuditPage() {
  const [data, setData] = useState<Page<AuditLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/audit?page=${p}&size=${PAGE_SIZE}`);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const logs = data?.content ?? [];
  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return !q
      || l.actorEmail.toLowerCase().includes(q)
      || l.action.toLowerCase().includes(q)
      || (l.entityType ?? '').toLowerCase().includes(q)
      || (l.details ?? '').toLowerCase().includes(q);
  });

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#080f0a] py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-[#E8731A] dark:text-green-400 hover:underline text-sm flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Full activity trail — {totalElements.toLocaleString()} records
              </p>
            </div>
            <div className="flex gap-2 items-center bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-56"
                placeholder="Filter by actor, action, entity…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
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
            Loading audit logs…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-[#E8731A]/10 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#E8731A] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-display text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {search ? 'No matching entries' : 'No audit entries yet'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Every action taken in the system will be recorded here.</p>
          </div>
        ) : (
          <>
            {search && <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{filtered.length} of {logs.length} on this page</p>}
            <div className="bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-[#F8F5EE] dark:bg-gray-900/40">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timestamp</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actor</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Entity</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Details</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {filtered.map(log => {
                      const cat = actionCategory(log.action);
                      const isExpanded = expanded === log.id;
                      const hasExtra = log.oldValue || log.newValue;
                      return (
                        <React.Fragment key={log.id}>
                          <tr
                            className={`transition-colors ${hasExtra ? 'cursor-pointer hover:bg-gray-50/60 dark:hover:bg-gray-700/30' : 'hover:bg-gray-50/30 dark:hover:bg-gray-700/10'}`}
                            onClick={() => hasExtra && setExpanded(isExpanded ? null : log.id)}
                          >
                            <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap font-mono">{formatDate(log.performedAt)}</td>
                            <td className="px-5 py-3">
                              <p className="text-gray-800 dark:text-gray-200 font-medium">{log.actorEmail}</p>
                              {log.actorRole && <p className="text-xs text-gray-400 dark:text-gray-500">{log.actorRole}</p>}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_STYLE[cat]}`}>
                                {log.action.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {log.entityType ? (
                                <>
                                  <p className="text-gray-700 dark:text-gray-300 font-medium">{log.entityType}</p>
                                  {log.entityId && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{log.entityId.substring(0, 8)}…</p>}
                                </>
                              ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                            </td>
                            <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs">
                              <span className="line-clamp-2">{log.details ?? '—'}</span>
                              {hasExtra && (
                                <span className={`inline-flex items-center gap-0.5 text-[#E8731A] dark:text-green-400 text-[10px] font-semibold mt-0.5`}>
                                  {isExpanded ? '▲ hide diff' : '▼ show diff'}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono whitespace-nowrap">{log.ipAddress ?? '—'}</td>
                          </tr>
                          {isExpanded && hasExtra && (
                            <tr className="bg-gray-50/80 dark:bg-gray-900/40">
                              <td colSpan={6} className="px-5 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {log.oldValue && (
                                    <div>
                                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5">Before</p>
                                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">{log.oldValue}</pre>
                                    </div>
                                  )}
                                  {log.newValue && (
                                    <div>
                                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1.5">After</p>
                                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">{log.newValue}</pre>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && !search && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-[#F8F5EE] dark:bg-gray-900/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Page {page + 1} of {totalPages} · {totalElements.toLocaleString()} total
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
