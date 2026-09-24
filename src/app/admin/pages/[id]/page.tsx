'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SeoAnalyzer } from '@/components/admin/SeoAnalyzer';
import { SeoPreview } from '@/components/admin/SeoPreview';
import { SlugChangeModal } from '@/components/admin/SlugChangeModal';
import {
  FileText,
  Search,
  Share2,
  Code2,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function AdminPageEditPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<'seo' | 'content' | 'social' | 'schema'>('seo');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [originalSlug, setOriginalSlug] = useState('');
  const [slugModalOpen, setSlugModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    h1Title: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    secondaryKeywords: '',
    canonicalUrl: '',
    noIndex: false,
    noFollow: false,
    inSitemap: true,
    content: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '/og-image.jpg',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '/og-image.jpg',
    customSchemaJson: '',
    isPublished: true,
  });

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.page) {
          const p = data.page;
          setOriginalSlug(p.slug);
          setForm({
            title: p.title || '',
            slug: p.slug || '',
            h1Title: p.h1Title || '',
            metaTitle: p.metaTitle || '',
            metaDescription: p.metaDescription || '',
            focusKeyword: p.focusKeyword || '',
            secondaryKeywords: p.secondaryKeywords || '',
            canonicalUrl: p.canonicalUrl || `https://numvax.com/${p.slug}`,
            noIndex: p.noIndex ?? false,
            noFollow: p.noFollow ?? false,
            inSitemap: p.inSitemap ?? true,
            content: p.content || '',
            ogTitle: p.ogTitle || '',
            ogDescription: p.ogDescription || '',
            ogImage: p.ogImage || '/og-image.jpg',
            twitterTitle: p.twitterTitle || '',
            twitterDescription: p.twitterDescription || '',
            twitterImage: p.twitterImage || '/og-image.jpg',
            customSchemaJson: p.customSchemaJson || '',
            isPublished: p.isPublished ?? true,
          });
        }
      })
      .catch((err) => {
        console.error('Error loading page:', err);
        setErrorMessage('Failed to load page details.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSaveClick = () => {
    const formattedSlug = form.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (originalSlug && formattedSlug !== originalSlug) {
      setSlugModalOpen(true);
    } else {
      executeSave(false);
    }
  };

  const executeSave = async (createRedirect: boolean) => {
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createRedirectOnSlugChange: createRedirect }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage('Page content and SEO saved successfully! Public site updated.');
        setOriginalSlug(form.slug);
        setSlugModalOpen(false);
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save page.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage('Network error while saving page.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500">Loading Page Details...</span>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'seo', label: 'SEO & Meta', icon: Search },
    { id: 'content', label: 'Content Body', icon: FileText },
    { id: 'social', label: 'Social / OG', icon: Share2 },
    { id: 'schema', label: 'Custom Schema', icon: Code2 },
  ] as const;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pages"
              className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-neutral-900 tracking-tight">{form.title || 'Edit Page'}</h1>
                <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                  /{form.slug}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">Edit static page content, SEO metadata, and open graph tags.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://numvax.com/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live
            </a>

            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
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

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  active ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Content (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* TAB 1: SEO */}
            {activeTab === 'seo' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Internal Page Name</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">URL Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <label>SEO Meta Title</label>
                    <span className={form.metaTitle.length > 60 ? 'text-amber-600' : 'text-neutral-400'}>
                      {form.metaTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    placeholder="e.g., Privacy Policy — Zero Data Logging | Numvax"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <label>SEO Meta Description</label>
                    <span className={form.metaDescription.length > 160 ? 'text-amber-600' : 'text-neutral-400'}>
                      {form.metaDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    placeholder="Concise summary for search engines..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Focus Keyword</label>
                    <input
                      type="text"
                      value={form.focusKeyword}
                      onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                      placeholder="e.g., privacy policy"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Canonical URL</label>
                    <input
                      type="text"
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      placeholder="https://numvax.com/page-slug"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.noIndex}
                      onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                    NoIndex
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                    Published & Live
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.inSitemap}
                      onChange={(e) => setForm({ ...form, inSitemap: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                    In Sitemap
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: CONTENT BODY */}
            {activeTab === 'content' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">H1 Page Heading</label>
                  <input
                    type="text"
                    value={form.h1Title}
                    onChange={(e) => setForm({ ...form, h1Title: e.target.value })}
                    placeholder="Page H1 Title"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Page Content / Body</label>
                  <textarea
                    rows={14}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Enter page content or custom text..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: SOCIAL */}
            {activeTab === 'social' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Open Graph Title</label>
                  <input
                    type="text"
                    value={form.ogTitle}
                    onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                    placeholder={form.metaTitle || form.title}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Open Graph Description</label>
                  <textarea
                    rows={2}
                    value={form.ogDescription}
                    onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                    placeholder={form.metaDescription}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Open Graph Image URL</label>
                  <input
                    type="text"
                    value={form.ogImage}
                    onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                    placeholder="/og-image.jpg"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: SCHEMA */}
            {activeTab === 'schema' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Custom Schema JSON-LD</label>
                  <textarea
                    rows={8}
                    value={form.customSchemaJson}
                    onChange={(e) => setForm({ ...form, customSchemaJson: e.target.value })}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${form.title}"\n}`}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Previews (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-22">
            <SeoAnalyzer
              title={form.metaTitle}
              metaDescription={form.metaDescription}
              focusKeyword={form.focusKeyword}
              h1Title={form.h1Title}
              slug={form.slug}
              canonicalUrl={form.canonicalUrl}
              noIndex={form.noIndex}
              ogImage={form.ogImage}
            />

            <SeoPreview
              title={form.metaTitle || form.title}
              metaDescription={form.metaDescription}
              slug={form.slug}
              ogTitle={form.ogTitle}
              ogDescription={form.ogDescription}
              ogImage={form.ogImage}
              twitterTitle={form.twitterTitle}
              twitterDescription={form.twitterDescription}
              twitterImage={form.twitterImage}
            />
          </div>
        </div>
      </div>

      <SlugChangeModal
        isOpen={slugModalOpen}
        oldSlug={originalSlug}
        newSlug={form.slug}
        onConfirm={(createRedirect) => executeSave(createRedirect)}
        onCancel={() => setSlugModalOpen(false)}
      />
    </AdminLayout>
  );
}
