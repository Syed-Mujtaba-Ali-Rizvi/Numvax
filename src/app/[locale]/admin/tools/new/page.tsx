'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Wrench, Plus, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminNewToolPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    type: 'calculator',
    shortDescription: '',
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setForm((prev) => ({ ...prev, categoryId: data.categories[0].id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') ? slug : prev.slug,
      metaTitle: `${name} — Free Online Tool | Numvax`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success && data.tool) {
        router.push(`/admin/tools/${data.tool.id}`);
      } else {
        setError(data.error || 'Failed to create tool.');
      }
    } catch {
      setError('Network error while creating tool.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
          <Link
            href="/admin/tools"
            className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-neutral-800" /> Create New Tool
            </h1>
            <p className="text-xs text-neutral-500">Add a new calculator or utility to Numvax.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700">Tool Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Mortgage Calculator"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700">URL Slug</label>
            <input
              type="text"
              required
              placeholder="mortgage-calculator"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700">Tool Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
              >
                <option value="calculator">Calculator</option>
                <option value="pdf">PDF Utility</option>
                <option value="developer">Developer Tool</option>
                <option value="image">Image Tool</option>
                <option value="text">Text Utility</option>
                <option value="converter">Unit Converter</option>
                <option value="seo">SEO Tool</option>
                <option value="scanner">Scanner</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700">Short Subtitle</label>
            <input
              type="text"
              placeholder="Fast calculation of monthly payments, interest rates, and loan amortizations."
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700">Focus Keyword</label>
            <input
              type="text"
              placeholder="e.g., mortgage calculator"
              value={form.focusKeyword}
              onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700">SEO Meta Title</label>
            <input
              type="text"
              placeholder="Mortgage Calculator — Calculate Monthly Loan Payments | Numvax"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link
              href="/admin/tools"
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create & Open Editor
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
