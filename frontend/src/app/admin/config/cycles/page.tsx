'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { getCycles, createCycle, updateCycle, getDeadlines, upsertDeadline, deleteDeadline } from '@/lib/api';

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

export default function CyclesPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deadlines, setDeadlines] = useState<Record<string, any[]>>({});

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<any | null>(null);
  const [cycleForm, setCycleForm] = useState({ academicYear: '', name: '', openDate: '', closeDate: '', generalDeadline: '', active: false });
  const [saving, setSaving] = useState(false);

  // Deadline form
  const [deadlineForm, setDeadlineForm] = useState<Record<string, { grade: string; deadline: string; capacity: string }>>({});

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getCycles();
      setCycles(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadDeadlines = async (cycleId: string) => {
    if (deadlines[cycleId]) return;
    try {
      const data = await getDeadlines(cycleId);
      setDeadlines(prev => ({ ...prev, [cycleId]: Array.isArray(data) ? data : [] }));
    } catch {}
  };

  const toggleExpand = (cycleId: string) => {
    if (expanded === cycleId) {
      setExpanded(null);
    } else {
      setExpanded(cycleId);
      loadDeadlines(cycleId);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCycle(cycleForm);
      setShowCreate(false);
      setCycleForm({ academicYear: '', name: '', openDate: '', closeDate: '', generalDeadline: '', active: false });
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setSaving(true);
    try {
      await updateCycle(showEdit.id, cycleForm);
      setShowEdit(null);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cycle: any) => {
    setCycleForm({
      academicYear: cycle.academicYear,
      name: cycle.name ?? '',
      openDate: cycle.openDate ?? '',
      closeDate: cycle.closeDate ?? '',
      generalDeadline: cycle.generalDeadline ?? '',
      active: cycle.active ?? false,
    });
    setShowEdit(cycle);
  };

  const handleUpsertDeadline = async (cycleId: string) => {
    const df = deadlineForm[cycleId];
    if (!df?.grade || !df?.deadline) return alert('Grade and deadline are required.');
    try {
      await upsertDeadline(cycleId, { grade: df.grade, deadline: df.deadline, capacity: parseInt(df.capacity || '0') });
      setDeadlineForm(prev => ({ ...prev, [cycleId]: { grade: '', deadline: '', capacity: '' } }));
      const data = await getDeadlines(cycleId);
      setDeadlines(prev => ({ ...prev, [cycleId]: Array.isArray(data) ? data : [] }));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteDeadline = async (cycleId: string, deadlineId: string) => {
    if (!confirm('Delete this deadline?')) return;
    try {
      await deleteDeadline(cycleId, deadlineId);
      setDeadlines(prev => ({ ...prev, [cycleId]: prev[cycleId].filter((d: any) => d.id !== deadlineId) }));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const CycleFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
          <input value={cycleForm.academicYear} onChange={e => setCycleForm(p => ({ ...p, academicYear: e.target.value }))}
            placeholder="2026-2027" required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycle Name</label>
          <input value={cycleForm.name} onChange={e => setCycleForm(p => ({ ...p, name: e.target.value }))}
            placeholder="2026-2027 Admissions"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[['openDate', 'Open Date'], ['closeDate', 'Close Date'], ['generalDeadline', 'General Deadline']].map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input type="date" value={(cycleForm as any)[key]} onChange={e => setCycleForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="active" checked={cycleForm.active} onChange={e => setCycleForm(p => ({ ...p, active: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded" />
        <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Set as active cycle (deactivates current active)</label>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/config" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Configuration</Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admissions Cycles</h1>
        </div>
        <Button onClick={() => setShowCreate(true)}>New Cycle</Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading cycles...</div>
      ) : (
        <div className="space-y-4">
          {cycles.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-500 dark:text-gray-400">
              No admissions cycles yet. Create one to get started.
            </div>
          )}
          {cycles.map((cycle: any) => (
            <div key={cycle.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cycle.academicYear}</h3>
                      {cycle.active && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cycle.name}</p>
                  </div>
                  <div className="hidden sm:flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Opens: {fmt(cycle.openDate)}</span>
                    <span>Closes: {fmt(cycle.closeDate)}</span>
                    <span>Deadline: {fmt(cycle.generalDeadline)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" className="text-xs" onClick={() => openEdit(cycle)}>Edit</Button>
                  <Button variant="secondary" className="text-xs" onClick={() => toggleExpand(cycle.id)}>
                    {expanded === cycle.id ? 'Hide Deadlines' : 'Grade Deadlines'}
                  </Button>
                </div>
              </div>

              {/* Grade Deadlines */}
              {expanded === cycle.id && (
                <div className="border-t dark:border-gray-700 p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Grade-Level Deadlines & Capacity</h4>
                  <table className="min-w-full text-sm mb-4">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="pb-2 pr-4">Grade</th>
                        <th className="pb-2 pr-4">Deadline</th>
                        <th className="pb-2 pr-4">Capacity</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(deadlines[cycle.id] || []).map((d: any) => (
                        <tr key={d.id} className="text-gray-700 dark:text-gray-300">
                          <td className="py-2 pr-4 font-medium">{d.grade}</td>
                          <td className="py-2 pr-4">{fmt(d.deadline)}</td>
                          <td className="py-2 pr-4">{d.capacity ?? 0}</td>
                          <td className="py-2">
                            <button onClick={() => handleDeleteDeadline(cycle.id, d.id)}
                              className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                          </td>
                        </tr>
                      ))}
                      {(deadlines[cycle.id] || []).length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-gray-400">No grade deadlines set.</td></tr>
                      )}
                    </tbody>
                  </table>

                  {/* Add deadline row */}
                  <div className="flex items-end space-x-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Grade</label>
                      <input value={deadlineForm[cycle.id]?.grade ?? ''}
                        onChange={e => setDeadlineForm(p => ({ ...p, [cycle.id]: { ...p[cycle.id], grade: e.target.value } }))}
                        placeholder="e.g. Baby Class"
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Deadline</label>
                      <input type="date" value={deadlineForm[cycle.id]?.deadline ?? ''}
                        onChange={e => setDeadlineForm(p => ({ ...p, [cycle.id]: { ...p[cycle.id], deadline: e.target.value } }))}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Capacity</label>
                      <input type="number" min="0" value={deadlineForm[cycle.id]?.capacity ?? ''}
                        onChange={e => setDeadlineForm(p => ({ ...p, [cycle.id]: { ...p[cycle.id], capacity: e.target.value } }))}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-20" />
                    </div>
                    <Button className="text-xs" onClick={() => handleUpsertDeadline(cycle.id)}>Add</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Admissions Cycle" onClose={() => setShowCreate(false)} maxWidth="max-w-2xl">
          <form onSubmit={handleCreateCycle} className="space-y-4">
            <CycleFormFields />
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Create Cycle</Button>
            </div>
          </form>
        </Modal>
      )}

      {showEdit && (
        <Modal title={`Edit Cycle — ${showEdit.academicYear}`} onClose={() => setShowEdit(null)} maxWidth="max-w-2xl">
          <form onSubmit={handleEditCycle} className="space-y-4">
            <CycleFormFields />
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowEdit(null)}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
