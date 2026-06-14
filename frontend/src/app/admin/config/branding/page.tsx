'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { getBranding, updateBranding } from '@/lib/api';

export default function BrandingPage() {
  const [form, setForm] = useState({
    name: '', tagline: '', website: '', logoUrl: '', faviconUrl: '',
    primaryColor: '#2563eb', secondaryColor: '#64748b',
    fontFamily: '', address: '', contactEmail: '', contactPhone: '', emailSignature: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getBranding()
      .then((data: any) => {
        if (data) setForm(prev => ({ ...prev, ...data }));
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateBranding(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  if (isLoading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading branding settings...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center space-x-3">
        <Link href="/admin/config" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Configuration</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branding & School Profile</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>
      )}
      {saved && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-400">
          Branding saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">School Identity</h2>
            <div className="space-y-4">
              {field('name', 'School Name', 'text', 'e.g. Groupe Scolaire Officiel de Butare')}
              {field('tagline', 'Tagline', 'text', 'e.g. Excellence in Education')}
              {field('website', 'Website URL', 'url', 'https://school.rw')}
              {field('logoUrl', 'Logo URL', 'url', 'https://...')}
              {field('faviconUrl', 'Favicon URL', 'url', 'https://...')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Colours & Typography</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Colour</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                  <input type="text" value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Colour</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={form.secondaryColor} onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                  <input type="text" value={form.secondaryColor} onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="mt-4">{field('fontFamily', 'Font Family', 'text', 'e.g. Inter, sans-serif')}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Contact Details</h2>
            <div className="space-y-4">
              {field('address', 'Address', 'text', 'e.g. KG 7 Ave, Kigali, Rwanda')}
              {field('contactEmail', 'Contact Email', 'email', 'admissions@school.rw')}
              {field('contactPhone', 'Contact Phone', 'tel', '+250 788 000 000')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Email Signature</h2>
            <textarea
              value={form.emailSignature}
              onChange={e => setForm(p => ({ ...p, emailSignature: e.target.value }))}
              rows={4}
              placeholder="Appended to all outgoing emails..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" isLoading={saving} className="w-full">Save Branding</Button>
        </form>

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm sticky top-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Live Preview</h2>
            <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
              {/* Header preview */}
              <div className="p-4 flex items-center space-x-3" style={{ backgroundColor: form.primaryColor }}>
                {form.logoUrl && (
                  <img src={form.logoUrl} alt="Logo" className="h-8 w-8 rounded object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <span className="text-white font-bold text-lg" style={{ fontFamily: form.fontFamily || undefined }}>
                  {form.name || 'School Name'}
                </span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30">
                {form.tagline && <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">"{form.tagline}"</p>}
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {form.address && <p>📍 {form.address}</p>}
                  {form.contactEmail && <p>✉ {form.contactEmail}</p>}
                  {form.contactPhone && <p>📞 {form.contactPhone}</p>}
                  {form.website && <p>🌐 {form.website}</p>}
                </div>
              </div>
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs text-white font-medium" style={{ backgroundColor: form.primaryColor }}>
                    Primary
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs text-white font-medium" style={{ backgroundColor: form.secondaryColor }}>
                    Secondary
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
