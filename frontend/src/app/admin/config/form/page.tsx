'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import {
  getFormSections, createSection, updateSection, deleteSection,
  getFields, createField, updateField, deleteField,
} from '@/lib/api';

const FIELD_TYPES = ['TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'DATE', 'NUMBER', 'FILE'];

const emptyField = { label: '', helpText: '', fieldType: 'TEXT', options: '', required: false, displayOrder: 0, enabled: true };

export default function FormBuilderPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [fields, setFields] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [sectionModal, setSectionModal] = useState<'create' | any | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: '', description: '', displayOrder: 0, enabled: true });
  const [fieldModal, setFieldModal] = useState<{ sectionId: string; field?: any } | null>(null);
  const [fieldForm, setFieldForm] = useState<any>({ ...emptyField });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getFormSections();
      setSections(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadFields = async (sectionId: string) => {
    if (fields[sectionId]) return;
    try {
      const data = await getFields(sectionId);
      setFields(prev => ({ ...prev, [sectionId]: Array.isArray(data) ? data : [] }));
    } catch {}
  };

  const toggleSection = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    loadFields(id);
  };

  const refreshFields = async (sectionId: string) => {
    const data = await getFields(sectionId);
    setFields(prev => ({ ...prev, [sectionId]: Array.isArray(data) ? data : [] }));
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (sectionModal === 'create') {
        await createSection(sectionForm);
      } else {
        await updateSection(sectionModal.id, sectionForm);
      }
      setSectionModal(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section and all its fields?')) return;
    try { await deleteSection(id); load(); } catch (e: any) { alert(e.message); }
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldModal) return;
    setSaving(true);
    try {
      if (!fieldModal.field) {
        await createField(fieldModal.sectionId, fieldForm);
      } else {
        await updateField(fieldModal.field.id, fieldForm);
      }
      setFieldModal(null);
      refreshFields(fieldModal.sectionId);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteField = async (sectionId: string, fieldId: string) => {
    if (!confirm('Delete this field?')) return;
    try { await deleteField(fieldId); refreshFields(sectionId); } catch (e: any) { alert(e.message); }
  };

  const moveSection = async (section: any, dir: -1 | 1) => {
    try {
      await updateSection(section.id, { ...section, displayOrder: section.displayOrder + dir });
      load();
    } catch {}
  };

  const openSection = (section?: any) => {
    setSectionForm(section
      ? { name: section.name, description: section.description ?? '', displayOrder: section.displayOrder, enabled: section.enabled }
      : { name: '', description: '', displayOrder: sections.length, enabled: true });
    setSectionModal(section ?? 'create');
  };

  const openField = (sectionId: string, field?: any) => {
    setFieldForm(field
      ? { label: field.label, helpText: field.helpText ?? '', fieldType: field.fieldType, options: field.options ?? '', required: field.required, displayOrder: field.displayOrder, enabled: field.enabled }
      : { ...emptyField, displayOrder: (fields[sectionId] ?? []).length });
    setFieldModal({ sectionId, field });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/config" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Configuration</Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Form Builder</h1>
        </div>
        <Button onClick={() => openSection()}>Add Section</Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading form sections...</div>
      ) : (
        <div className="space-y-3">
          {sections.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-gray-500 dark:text-gray-400">
              No sections yet. Add a section to build your application form.
            </div>
          )}
          {sections.sort((a, b) => a.displayOrder - b.displayOrder).map((section: any) => (
            <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col space-y-0.5">
                    <button onClick={() => moveSection(section, -1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none">▲</button>
                    <button onClick={() => moveSection(section, 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none">▼</button>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{section.name}</h3>
                      {!section.enabled && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Disabled</span>}
                    </div>
                    {section.description && <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => openSection(section)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                  <button onClick={() => { updateSection(section.id, { ...section, enabled: !section.enabled }).then(load); }}
                    className={`text-xs ${section.enabled ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'} hover:underline`}>
                    {section.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleDeleteSection(section.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Delete</button>
                  <Button variant="secondary" className="text-xs" onClick={() => toggleSection(section.id)}>
                    {expanded === section.id ? 'Hide Fields' : 'Fields'}
                  </Button>
                </div>
              </div>

              {expanded === section.id && (
                <div className="border-t dark:border-gray-700 p-4">
                  <div className="space-y-2 mb-4">
                    {(fields[section.id] || []).length === 0 && (
                      <p className="text-sm text-gray-400">No fields in this section yet.</p>
                    )}
                    {(fields[section.id] || []).sort((a, b) => a.displayOrder - b.displayOrder).map((f: any) => (
                      <div key={f.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/30 rounded-lg px-4 py-2.5">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-mono">{f.fieldType}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{f.label}</span>
                          {f.required && <span className="text-xs text-red-500">*required</span>}
                          {!f.enabled && <span className="text-xs text-gray-400">(disabled)</span>}
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => openField(section.id, f)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                          <button onClick={() => handleDeleteField(section.id, f.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" className="text-xs" onClick={() => openField(section.id)}>+ Add Field</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section Modal */}
      {sectionModal !== null && (
        <Modal title={sectionModal === 'create' ? 'New Section' : `Edit Section — ${(sectionModal as any).name}`} onClose={() => setSectionModal(null)}>
          <form onSubmit={handleSaveSection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Name</label>
              <input required value={sectionForm.name} onChange={e => setSectionForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
              <textarea value={sectionForm.description} onChange={e => setSectionForm(p => ({ ...p, description: e.target.value }))}
                rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                <input type="number" value={sectionForm.displayOrder} onChange={e => setSectionForm(p => ({ ...p, displayOrder: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={sectionForm.enabled} onChange={e => setSectionForm(p => ({ ...p, enabled: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setSectionModal(null)}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Save Section</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Field Modal */}
      {fieldModal !== null && (
        <Modal title={fieldModal.field ? `Edit Field — ${fieldModal.field.label}` : 'Add Field'} onClose={() => setFieldModal(null)}>
          <form onSubmit={handleSaveField} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
              <input required value={fieldForm.label} onChange={e => setFieldForm((p: any) => ({ ...p, label: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Help Text (optional)</label>
              <input value={fieldForm.helpText} onChange={e => setFieldForm((p: any) => ({ ...p, helpText: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field Type</label>
                <select value={fieldForm.fieldType} onChange={e => setFieldForm((p: any) => ({ ...p, fieldType: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                <input type="number" value={fieldForm.displayOrder} onChange={e => setFieldForm((p: any) => ({ ...p, displayOrder: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {fieldForm.fieldType === 'SELECT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options (comma-separated)</label>
                <textarea value={fieldForm.options} onChange={e => setFieldForm((p: any) => ({ ...p, options: e.target.value }))}
                  rows={3} placeholder="Option A,Option B,Option C"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={fieldForm.required} onChange={e => setFieldForm((p: any) => ({ ...p, required: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={fieldForm.enabled} onChange={e => setFieldForm((p: any) => ({ ...p, enabled: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setFieldModal(null)}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Save Field</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
