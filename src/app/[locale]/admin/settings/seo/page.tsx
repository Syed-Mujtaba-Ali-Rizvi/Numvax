'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';

export default function AdminGlobalSeoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    siteName: 'Numvax',
    tagline: 'Fast, accurate and easy-to-use free online tools',
    titleTemplate: '{{title}} | Numvax',
    defaultMetaDescription:
      'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools.',
    defaultOgImage: '/og-image.jpg',
    defaultRobots: 'index, follow',
    defaultCanonical: 'https://numvax.com',
    socialTwitter: 'https://twitter.com/numvax',
    socialFacebook: '',
    socialGithub: 'https://github.com/numvax',
    socialLinkedin: '',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setFormData((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Global SEO settings successfully updated!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  // Preview live computed title
  const sampleToolTitle = 'Percentage Calculator';
  const computedPreviewTitle = formData.titleTemplate.replace('{{title}}', sampleToolTitle);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Globe className="w-6 h-6 text-neutral-900" />
              Global SEO & Metadata Settings
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Configure sitewide meta templates, default OpenGraph social cards, canonical rules, and search crawler defaults.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="underline ml-4">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Metadata Template Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-700" />
              Sitewide Title & Description Templates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Brand Name / Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Primary Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Global Meta Title Pattern
                </label>
                <span className="text-[11px] text-neutral-400">Use <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-700">&#123;&#123;title&#125;&#125;</code> as placeholder</span>
              </div>
              <input
                type="text"
                name="titleTemplate"
                value={formData.titleTemplate}
                onChange={handleChange}
                placeholder="{{title}} | Numvax"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono text-neutral-900"
                required
              />

              {/* Title pattern live preview */}
              <div className="mt-2.5 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs flex items-center justify-between">
                <span className="text-neutral-500">Live Title Pattern Preview:</span>
                <span className="font-semibold text-neutral-900">{computedPreviewTitle}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Default Meta Description (Fallback for Pages without custom description)
              </label>
              <textarea
                name="defaultMetaDescription"
                value={formData.defaultMetaDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed"
                placeholder="Brief summary of Numvax utilities..."
              />
              <div className="text-right text-[11px] text-neutral-400 mt-1">
                {formData.defaultMetaDescription.length} / 160 characters (Recommended: 120-160)
              </div>
            </div>
          </div>

          {/* Social Media & OpenGraph Sharing */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-neutral-700" />
              Social Sharing & OpenGraph Default Cards
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Default Social Sharing Image URL (og:image)
              </label>
              <input
                type="text"
                name="defaultOgImage"
                value={formData.defaultOgImage}
                onChange={handleChange}
                placeholder="/og-image.jpg or https://..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Used when a specific tool does not define a custom OG image. Recommended size: 1200x630px.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Twitter / X Profile URL
                </label>
                <input
                  type="url"
                  name="socialTwitter"
                  value={formData.socialTwitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/numvax"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  name="socialGithub"
                  value={formData.socialGithub}
                  onChange={handleChange}
                  placeholder="https://github.com/numvax"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Crawler Defaults & Canonical Domain */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-700" />
              Crawling & Canonical Behavior
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Primary Canonical Base Domain
                </label>
                <input
                  type="url"
                  name="defaultCanonical"
                  value={formData.defaultCanonical}
                  onChange={handleChange}
                  placeholder="https://numvax.com"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Default Robots Meta Tag
                </label>
                <select
                  name="defaultRobots"
                  value={formData.defaultRobots}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                >
                  <option value="index, follow">index, follow (Recommended for maximum search reach)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Global SEO Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
