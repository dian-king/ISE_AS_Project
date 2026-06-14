'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { getWorkflowConfigs, upsertWorkflow, deleteWorkflow } from '@/lib/api';

const INTERVIEW_OPTIONS = [
  { value: 'REQUIRED', label: 'Required — all applicants must interview' },
  { value: 'OPTIONAL', label: 'Optional — at admissions officer discretion' },
  { value: 'NOT_REQUIRED', label: 'Not Required' },
];

const emptyRule = { grade: '', interviewRequirement: 'OPTIONAL', reviewRounds: 1, committeeMinMembers: 1, principalApprovalRequired: true };

export default function WorkflowPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyRule });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getWorkflowConfigs();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const defaultConfig = configs.find(c => !c.grade);
  const overrides = configs.filter(c => c.grade);

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertWorkflow(form);
      setShowAdd(false);
      setForm({ ...emptyRule });
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this workflow override?')) return;
    try {
      await deleteWorkflow(id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const RuleForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade (leave blank for school-wide default)</label>
        <input value={form.grade} onChange={e => setForm((p: any) => ({ ...p, grade: e.target.value }))}
          placeholder="e.g. Senior 4, Primary 1"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Requirement</label>
        <select value={form.interviewRequirement} onChange={e => setForm((p: any) => ({ ...p, interviewRequirement: e.target.value }))}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {INTERVIEW_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Rounds</label>
          <input type="number" min="1" max="3" value={form.reviewRounds} onChange={e => setForm((p: any) => ({ ...p, reviewRounds: parseInt(e.target.value) }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Committee Members</label>
          <input type="number" min="1" max="10" value={form.committeeMinMembers} onChange={e => setForm((p: any) => ({ ...p, committeeMinMembers: parseInt(e.target.value) }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="pa" checked={form.principalApprovalRequired} onChange={e => setForm((p: any) => ({ ...p, principalApprovalRequired: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded" />
        <label htmlFor="pa" className="text-sm text-gray-700 dark:text-gray-300">Require Principal approval before releasing decisions</label>
      </div>
    </div>
  );

  const ConfigCard = ({ config }: { config: any }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      {[
        ['Interview', config.interviewRequirement?.replace(/_/g, ' ')],
        ['Review Rounds', config.reviewRounds],
        ['Min Committee', config.committeeMinMembers],
        ['Principal Approval', config.principalApprovalRequired ? 'Required' : 'Not Required'],
      ].map(([label, value]) => (
        <div key={label as string}>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/config" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Configuration</Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Rules</h1>
        </div>
        <Button onClick={() => { setForm({ ...emptyRule }); setShowAdd(true); }}>Add Override</Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading workflow config...</div>
      ) : (
        <div className="space-y-4">
          {/* School Default */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">School Default</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Applies to all grades unless overridden below</p>
              </div>
              <Button variant="secondary" className="text-xs"
                onClick={() => { setForm(defaultConfig ? { ...defaultConfig } : { ...emptyRule, grade: '' }); setShowAdd(true); }}>
                {defaultConfig ? 'Edit Default' : 'Set Default'}
              </Button>
            </div>
            {defaultConfig ? <ConfigCard config={defaultConfig} /> : (
              <p className="text-sm text-gray-400">No school default configured yet.</p>
            )}
          </div>

          {/* Grade overrides */}
          {overrides.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Grade-Level Overrides</h3>
              <div className="space-y-3">
                {overrides.map((cfg: any) => (
                  <div key={cfg.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{cfg.grade}</span>
                      <div className="flex space-x-2">
                        <button onClick={() => { setForm({ ...cfg }); setShowAdd(true); }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(cfg.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline">Remove</button>
                      </div>
                    </div>
                    <ConfigCard config={cfg} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <Modal title={form.id ? 'Edit Workflow Rule' : 'Add Workflow Rule'} onClose={() => setShowAdd(false)}>
          <form onSubmit={handleUpsert} className="space-y-4">
            <RuleForm />
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Save Rule</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
