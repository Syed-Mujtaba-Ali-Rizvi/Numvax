'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SeoAnalyzer } from '@/components/admin/SeoAnalyzer';
import { SeoPreview } from '@/components/admin/SeoPreview';
import { FaqListEditor, FAQItem } from '@/components/admin/FaqListEditor';
import { WorkedExamplesEditor, WorkedExample } from '@/components/admin/WorkedExamplesEditor';
import { SlugChangeModal } from '@/components/admin/SlugChangeModal';
import {
  Wrench,
  Search,
  Globe,
  FileText,
  HelpCircle,
  Share2,
  Code2,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

export default function AdminToolEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<'seo' | 'content' | 'faqs' | 'social' | 'search' | 'general' | 'schema'>('seo');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Categories & Tools list for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [availableTools, setAvailableTools] = useState<any[]>([]);

  // Slug change state
  const [originalSlug, setOriginalSlug] = useState('');
  const [slugModalOpen, setSlugModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    type: 'calculator',
    shortDescription: '',
    description: '',
    focusKeyword: '',
    secondaryKeywords: '',
    searchKeywords: '',
    searchAliases: '',
    relatedToolSlugs: [] as string[],
    isPopular: false,
    isFeatured: false,
    isEnabled: true,
    isDraft: false,
    inSitemap: true,
    // Content & SEO
    h1Title: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    noIndex: false,
    noFollow: false,
    explanation: '',
    directAnswer: '',
    formulaTitle: '',
    formulaDescription: '',
    instructionsTitle: '',
    instructionsDescription: '',
    useCases: '',
    trustCopy: '',
    workedExamples: [] as WorkedExample[],
    faqs: [] as FAQItem[],
    ogTitle: '',
    ogDescription: '',
    ogImage: '/og-image.jpg',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '/og-image.jpg',
    customSchemaJson: '',
  });

  // Fetch Tool Data
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/admin/tools/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.tool) {
          const t = data.tool;
          const c = t.content || {};

          let parsedFaqs: FAQItem[] = [];
          if (c.faqItemsJson) {
            try {
              parsedFaqs = JSON.parse(c.faqItemsJson);
            } catch {}
          }

          let parsedExamples: WorkedExample[] = [];
          if (c.workedExamplesJson) {
            try {
              parsedExamples = JSON.parse(c.workedExamplesJson);
            } catch {}
          }

          let parsedRelated: string[] = [];
          if (t.relatedToolSlugs) {
            try {
              parsedRelated = JSON.parse(t.relatedToolSlugs);
            } catch {}
          }

          setOriginalSlug(t.slug);
          setCategories(data.categories || []);
          setAvailableTools(data.availableRelatedTools || []);

          setForm({
            name: t.name || '',
            slug: t.slug || '',
            categoryId: t.categoryId || '',
            type: t.type || 'calculator',
            shortDescription: t.shortDescription || '',
            description: t.description || '',
            focusKeyword: t.focusKeyword || '',
            secondaryKeywords: t.secondaryKeywords || '',
            searchKeywords: t.searchKeywords || '',
            searchAliases: t.searchAliases || '',
            relatedToolSlugs: parsedRelated,
            isPopular: t.isPopular ?? false,
            isFeatured: t.isFeatured ?? false,
            isEnabled: t.isEnabled ?? true,
            isDraft: t.isDraft ?? false,
            inSitemap: t.inSitemap ?? true,
            h1Title: c.h1Title || '',
            metaTitle: c.metaTitle || '',
            metaDescription: c.metaDescription || '',
            canonicalUrl: c.canonicalUrl || `https://numvax.com/${t.slug}`,
            noIndex: c.noIndex ?? false,
            noFollow: c.noFollow ?? false,
            explanation: c.explanation || '',
            directAnswer: c.directAnswer || '',
            formulaTitle: c.formulaTitle || '',
            formulaDescription: c.formulaDescription || '',
            instructionsTitle: c.instructionsTitle || '',
            instructionsDescription: c.instructionsDescription || '',
            useCases: c.useCases || '',
            trustCopy: c.trustCopy || '',
            workedExamples: parsedExamples,
            faqs: parsedFaqs,
            ogTitle: c.ogTitle || '',
            ogDescription: c.ogDescription || '',
            ogImage: c.ogImage || '/og-image.jpg',
            twitterTitle: c.twitterTitle || '',
            twitterDescription: c.twitterDescription || '',
            twitterImage: c.twitterImage || '/og-image.jpg',
            customSchemaJson: c.customSchemaJson || '',
          });
        }
      })
      .catch((err) => {
        console.error('Error loading tool:', err);
        setErrorMessage('Failed to load tool details.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSaveClick = (isPublish = false) => {
    if (isPublish) {
      setForm((prev) => ({ ...prev, isDraft: false, isEnabled: true }));
    }

    // Check if slug changed
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
      const payload = {
        ...form,
        relatedToolSlugs: JSON.stringify(form.relatedToolSlugs),
        workedExamplesJson: JSON.stringify(form.workedExamples),
        faqItemsJson: JSON.stringify(form.faqs),
        createRedirectOnSlugChange: createRedirect,
      };

      const res = await fetch(`/api/admin/tools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage('Tool and SEO metadata saved successfully! Public site updated.');
        setOriginalSlug(form.slug);
        setSlugModalOpen(false);
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save tool changes.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage('Network error while saving tool.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500">Loading Tool Details...</span>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
    { id: 'content', label: 'Content & H1', icon: FileText },
    { id: 'faqs', label: 'Examples & FAQs', icon: HelpCircle },
    { id: 'social', label: 'Social / OG', icon: Share2 },
    { id: 'search', label: 'Internal Links & Search', icon: Wrench },
    { id: 'general', label: 'General & Status', icon: Sliders },
    { id: 'schema', label: 'Structured Data', icon: Code2 },
  ] as const;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/tools"
              className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-neutral-900 tracking-tight">{form.name || 'Edit Tool'}</h1>
                <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                  /{form.slug}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">Edit tool content, SEO tags, schema, and keywords.</p>
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
              onClick={() => handleSaveClick(false)}
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
          <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl overflow-x-auto w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  active ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Edit Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* TAB 1: SEO & METADATA */}
            {activeTab === 'seo' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Search className="w-4 h-4 text-neutral-700" /> Basic SEO & Indexing
                </h3>

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
                    placeholder="e.g., Free BMI Calculator — Body Mass Index | Numvax"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <span className="text-[11px] text-neutral-400">Appears in Google search results and browser tab.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <label>Meta Description</label>
                    <span className={form.metaDescription.length > 160 ? 'text-amber-600' : 'text-neutral-400'}>
                      {form.metaDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    placeholder="Accurate description of what the tool does, formula used, and key benefits..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Recommended 120-160 characters. Include your target focus keyword.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Focus Keyword</label>
                    <input
                      type="text"
                      value={form.focusKeyword}
                      onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                      placeholder="e.g., bmi calculator"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Secondary Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={form.secondaryKeywords}
                      onChange={(e) => setForm({ ...form, secondaryKeywords: e.target.value })}
                      placeholder="calculate bmi, body mass index, healthy weight"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Canonical URL</label>
                  <input
                    type="text"
                    value={form.canonicalUrl}
                    onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                    placeholder="https://numvax.com/tool-slug"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.noIndex}
                      onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-400"
                    />
                    NoIndex (Hide from Google)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.noFollow}
                      onChange={(e) => setForm({ ...form, noFollow: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-400"
                    />
                    NoFollow (Do not follow links)
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: CONTENT & H1 */}
            {activeTab === 'content' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <FileText className="w-4 h-4 text-neutral-700" /> Content & Headings
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">H1 Page Heading</label>
                  <input
                    type="text"
                    value={form.h1Title}
                    onChange={(e) => setForm({ ...form, h1Title: e.target.value })}
                    placeholder="e.g., BMI Calculator - Body Mass Index & Weight Range"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Direct Answer / Summary Box</label>
                  <textarea
                    rows={2}
                    value={form.directAnswer}
                    onChange={(e) => setForm({ ...form, directAnswer: e.target.value })}
                    placeholder="Concise direct answer summarizing what the tool does..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Main Explanation & Body</label>
                  <textarea
                    rows={4}
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    placeholder="In-depth explanation of the calculation methods, definitions, and concepts..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Instructions / How-To Title</label>
                    <input
                      type="text"
                      value={form.instructionsTitle}
                      onChange={(e) => setForm({ ...form, instructionsTitle: e.target.value })}
                      placeholder="e.g., How to Calculate Your BMI"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Trust / Privacy Copy</label>
                    <input
                      type="text"
                      value={form.trustCopy}
                      onChange={(e) => setForm({ ...form, trustCopy: e.target.value })}
                      placeholder="Processed 100% locally in your browser. Never sent to servers."
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Step-by-Step Instructions</label>
                  <textarea
                    rows={3}
                    value={form.instructionsDescription}
                    onChange={(e) => setForm({ ...form, instructionsDescription: e.target.value })}
                    placeholder="1. Enter your height in centimeters or inches...&#10;2. Enter your weight...&#10;3. View your BMI score..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Use Cases & Applications</label>
                  <textarea
                    rows={2}
                    value={form.useCases}
                    onChange={(e) => setForm({ ...form, useCases: e.target.value })}
                    placeholder="Who uses this tool and for what real-world purposes..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: EXAMPLES & FAQS */}
            {activeTab === 'faqs' && (
              <div className="flex flex-col gap-6 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <FaqListEditor faqs={form.faqs} onChange={(faqs) => setForm({ ...form, faqs })} />
                <div className="border-t border-neutral-200 pt-4">
                  <WorkedExamplesEditor
                    examples={form.workedExamples}
                    onChange={(workedExamples) => setForm({ ...form, workedExamples })}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: SOCIAL / OPEN GRAPH */}
            {activeTab === 'social' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Share2 className="w-4 h-4 text-neutral-700" /> Social & Open Graph Metadata
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Open Graph Title (Facebook / LinkedIn)</label>
                  <input
                    type="text"
                    value={form.ogTitle}
                    onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                    placeholder={form.metaTitle || form.name}
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

                <div className="border-t border-neutral-200 pt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Twitter / X Title</label>
                    <input
                      type="text"
                      value={form.twitterTitle}
                      onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })}
                      placeholder={form.ogTitle || form.metaTitle}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Twitter / X Description</label>
                    <textarea
                      rows={2}
                      value={form.twitterDescription}
                      onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })}
                      placeholder={form.ogDescription || form.metaDescription}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: INTERNAL SEARCH & RELATED TOOLS */}
            {activeTab === 'search' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Wrench className="w-4 h-4 text-neutral-700" /> Internal Search & Related Links
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Internal Search Keywords</label>
                  <input
                    type="text"
                    value={form.searchKeywords}
                    onChange={(e) => setForm({ ...form, searchKeywords: e.target.value })}
                    placeholder="e.g., bmi, body mass index, weight calculator, healthy weight"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Comma-separated terms that power Numvax&apos;s instant on-site tool search engine.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Search Aliases & Synonyms</label>
                  <input
                    type="text"
                    value={form.searchAliases}
                    onChange={(e) => setForm({ ...form, searchAliases: e.target.value })}
                    placeholder="e.g., mass index, bmi check, obesity meter"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-xs font-bold text-neutral-700">Related Tools (Internal Link Mesh)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-white border border-neutral-200 rounded-xl">
                    {availableTools.map((t) => {
                      const isSelected = form.relatedToolSlugs.includes(t.slug);
                      return (
                        <label
                          key={t.id}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-neutral-900 text-white font-bold' : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, relatedToolSlugs: [...form.relatedToolSlugs, t.slug] });
                              } else {
                                setForm({
                                  ...form,
                                  relatedToolSlugs: form.relatedToolSlugs.filter((s) => s !== t.slug),
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
            )}

            {/* TAB 6: GENERAL & VISIBILITY */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Sliders className="w-4 h-4 text-neutral-700" /> General Tool Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Tool Display Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">URL Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Tool Category</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
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
                      className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                      <option value="calculator">Calculator</option>
                      <option value="pdf">PDF Utility</option>
                      <option value="developer">Developer Tool</option>
                      <option value="image">Image Editor</option>
                      <option value="text">Text Utility</option>
                      <option value="converter">Unit Converter</option>
                      <option value="seo">SEO Tool</option>
                      <option value="scanner">Document Scanner</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Short Subtitle / Description</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Brief description displayed on cards and category lists..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer p-3 bg-white border border-neutral-200 rounded-xl">
                    <input
                      type="checkbox"
                      checked={form.isEnabled}
                      onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                    Enabled
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer p-3 bg-white border border-neutral-200 rounded-xl">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                    Featured
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer p-3 bg-white border border-neutral-200 rounded-xl">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                    Popular
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer p-3 bg-white border border-neutral-200 rounded-xl">
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

            {/* TAB 7: STRUCTURED DATA */}
            {activeTab === 'schema' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-50/70 border border-neutral-200 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <Code2 className="w-4 h-4 text-neutral-700" /> Custom JSON-LD Structured Data
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Custom Schema JSON</label>
                  <textarea
                    rows={8}
                    value={form.customSchemaJson}
                    onChange={(e) => setForm({ ...form, customSchemaJson: e.target.value })}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "${form.name}",\n  "applicationCategory": "UtilityApplication"\n}`}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Optional custom schema to inject in addition to the standard Breadcrumb and WebPage schemas.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Live Preview & SEO Score (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-22">
            {/* Live SEO Analyzer */}
            <SeoAnalyzer
              title={form.metaTitle}
              metaDescription={form.metaDescription}
              focusKeyword={form.focusKeyword}
              h1Title={form.h1Title}
              slug={form.slug}
              canonicalUrl={form.canonicalUrl}
              noIndex={form.noIndex}
              ogImage={form.ogImage}
              faqCount={form.faqs.length}
              examplesCount={form.workedExamples.length}
            />

            {/* Live SERP & Social Preview */}
            <SeoPreview
              title={form.metaTitle || form.name}
              metaDescription={form.metaDescription || form.shortDescription}
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

      {/* Slug Change Safety Modal */}
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
