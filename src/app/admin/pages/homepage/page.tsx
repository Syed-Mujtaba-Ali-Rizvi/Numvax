'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SeoAnalyzer } from '@/components/admin/SeoAnalyzer';
import { SeoPreview } from '@/components/admin/SeoPreview';
import {
  Home,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function AdminHomepageManagerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [availableTools, setAvailableTools] = useState<any[]>([]);

  const [form, setForm] = useState({
    heroHeading: '',
    heroDescription: '',
    searchPlaceholder: '',
    featuredToolSlugs: [] as string[],
    popularToolSlugs: [] as string[],
    // SEO
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    canonicalUrl: 'https://numvax.com/',
  });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetch('/api/admin/settings'), fetch('/api/admin/pages/homepage')])
      .then(async ([settingsRes, pageRes]) => {
        const settingsData = await settingsRes.json();
        const pageData = await pageRes.json();

        if (settingsData.success && settingsData.settings) {
          const s = settingsData.settings;
          const p = pageData.page || {};

          let featured: string[] = [];
          if (s.featuredToolSlugs) {
            try {
              featured = typeof s.featuredToolSlugs === 'string' ? JSON.parse(s.featuredToolSlugs) : s.featuredToolSlugs;
            } catch {}
          }

          let popular: string[] = [];
          if (s.popularToolSlugs) {
            try {
              popular = typeof s.popularToolSlugs === 'string' ? JSON.parse(s.popularToolSlugs) : s.popularToolSlugs;
            } catch {}
          }

          setAvailableTools(settingsData.availableTools || []);

          setForm({
            heroHeading: s.heroHeading || "Every Online Tool You'll Ever Need. 100% Free & Private.",
            heroDescription:
              s.heroDescription ||
              'Fast, precise, client-side tools: Calculators, PDF utilities, image editors, developer formatters, and converters.',
            searchPlaceholder:
              s.searchPlaceholder || 'Search 50+ tools (e.g., BMI Calculator, Merge PDF, JSON Formatter)...',
            featuredToolSlugs: featured,
            popularToolSlugs: popular,
            metaTitle: p.metaTitle || 'Numvax — Free Online Tools & Calculators',
            metaDescription:
              p.metaDescription ||
              'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools for everyday life, work and study.',
            focusKeyword: p.focusKeyword || 'free online tools',
            canonicalUrl: p.canonicalUrl || 'https://numvax.com/',
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage data:', err);
        setErrorMessage('Failed to load homepage settings.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const [settingsRes, pageRes] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            heroHeading: form.heroHeading,
            heroDescription: form.heroDescription,
            searchPlaceholder: form.searchPlaceholder,
            featuredToolSlugs: form.featuredToolSlugs,
            popularToolSlugs: form.popularToolSlugs,
          }),
        }),
        fetch('/api/admin/pages/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Homepage',
            slug: 'homepage',
            h1Title: form.heroHeading,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
            focusKeyword: form.focusKeyword,
            canonicalUrl: form.canonicalUrl,
          }),
        }),
      ]);

      const sData = await settingsRes.json();
      const pData = await pageRes.json();

      if (sData.success && pData.success) {
        setSaveSuccessMessage('Homepage content and SEO updated successfully!');
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(sData.error || pData.error || 'Failed to update homepage.');
      }
    } catch {
      setErrorMessage('Network error while saving homepage.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500">Loading Homepage Manager...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pages"
              className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <Home className="w-5 h-5 text-neutral-800" /> Homepage Content & SEO
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">Control hero copy, search bar prompt, featured tools, and metadata.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://numvax.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live Homepage
            </a>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Homepage
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccessMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            {saveSuccessMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Hero Content */}
            <div className="p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                <Sparkles className="w-4 h-4 text-neutral-700" /> Hero Section Content
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700">Hero Main Heading (H1)</label>
                <input
                  type="text"
                  required
                  value={form.heroHeading}
                  onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700">Hero Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={form.heroDescription}
                  onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700">Search Bar Placeholder</label>
                <input
                  type="text"
                  value={form.searchPlaceholder}
                  onChange={(e) => setForm({ ...form, searchPlaceholder: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>
            </div>

            {/* 2. Featured Tools */}
            <div className="p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                <Layers className="w-4 h-4 text-neutral-700" /> Featured & Popular Tools on Homepage
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700">Featured Highlighted Tools</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-neutral-200 rounded-xl">
                  {availableTools.map((t) => {
                    const isSelected = form.featuredToolSlugs.includes(t.slug);
                    return (
                      <label
                        key={t.slug}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-neutral-900 text-white font-bold' : 'hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, featuredToolSlugs: [...form.featuredToolSlugs, t.slug] });
                            } else {
                              setForm({
                                ...form,
                                featuredToolSlugs: form.featuredToolSlugs.filter((s) => s !== t.slug),
                              });
                            }
                          }}
                          className="hidden"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Homepage SEO */}
            <div className="p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                <Search className="w-4 h-4 text-neutral-700" /> Homepage SEO & Metadata
              </h3>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-neutral-700">
                  <label>Homepage SEO Meta Title</label>
                  <span className={form.metaTitle.length > 60 ? 'text-amber-600' : 'text-neutral-400'}>
                    {form.metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-neutral-700">
                  <label>Homepage Meta Description</label>
                  <span className={form.metaDescription.length > 160 ? 'text-amber-600' : 'text-neutral-400'}>
                    {form.metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700">Focus Keyword</label>
                <input
                  type="text"
                  value={form.focusKeyword}
                  onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                  placeholder="free online tools"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-22">
            <SeoAnalyzer
              title={form.metaTitle}
              metaDescription={form.metaDescription}
              focusKeyword={form.focusKeyword}
              h1Title={form.heroHeading}
              slug=""
              canonicalUrl={form.canonicalUrl}
            />

            <SeoPreview
              title={form.metaTitle}
              metaDescription={form.metaDescription}
              slug="homepage"
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
