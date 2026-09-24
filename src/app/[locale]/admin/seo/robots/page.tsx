'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Bot,
  Save,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Terminal,
} from 'lucide-react';

export default function AdminRobotsPage() {
  const [content, setContent] = useState('');
  const [defaultContent, setDefaultContent] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const fetchRobots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo/robots');
      const json = await res.json();
      if (json.success) {
        setContent(json.content);
        setDefaultContent(json.defaultContent);
        setIsDefault(json.isDefault);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/seo/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.warning) {
          setMessage({ type: 'warning', text: json.warning });
        } else {
          setMessage({ type: 'success', text: 'Robots.txt updated and live!' });
        }
        setIsDefault(false);
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to update robots.txt' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefault = async () => {
    if (!confirm('Are you sure you want to restore standard recommended robots.txt settings?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/robots', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setContent(json.content);
        setIsDefault(true);
        setMessage({ type: 'success', text: 'Robots.txt restored to standard defaults' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to restore default' });
    } finally {
      setSaving(false);
    }
  };

  // Syntax safety checks
  const hasDisallowAll = /Disallow:\s*\/\s*$/m.test(content) && !/Allow:\s*\/\s*$/m.test(content);
  const hasSitemapDirective = /Sitemap:\s*https?:\/\//i.test(content);
  const hasAdminDisallow = /Disallow:\s*\/admin/i.test(content);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-neutral-900" />
              Robots.txt Editor
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Control search engine crawler behavior, indexing permissions, and sitemap discovery pointers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded-xl text-neutral-700 transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Live robots.txt
            </a>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>

        {/* Alerts & Notifications */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : message.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Safety Warning if Disallowing Root */}
        {hasDisallowAll && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Critical Warning: "Disallow: /" Detected!</div>
              <p className="mt-0.5 text-rose-800">
                This rule instructs all search engines (Google, Bing) to de-index and ignore your entire website. If this is not intentional, remove it or restore standard defaults.
              </p>
            </div>
          </div>
        )}

        {/* Editor Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-800 font-mono">robots.txt</span>
              {isDefault && (
                <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md font-medium">
                  Default Recommended Configuration
                </span>
              )}
            </div>

            <button
              onClick={handleRestoreDefault}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Recommended Defaults
            </button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-neutral-400 text-xs">
                Loading configuration...
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full p-4 font-mono text-xs bg-neutral-950 text-emerald-400 rounded-xl border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner resize-y"
                placeholder="User-agent: *..."
              />
            )}
          </div>

          {/* Validation Checklist */}
          <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              {hasSitemapDirective ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-neutral-700">
                {hasSitemapDirective ? 'Sitemap directive included' : 'Missing Sitemap declaration'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {hasAdminDisallow ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Info className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-neutral-700">
                {hasAdminDisallow ? '/admin route protected from crawler' : 'Admin path not explicitly disallowed'}
              </span>
            </div>
          </div>
        </div>

        {/* Best Practice Tips */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-neutral-700" />
            Crawler Directive Reference & Best Practices
          </h3>
          <ul className="text-xs text-neutral-600 space-y-1.5 list-disc pl-5">
            <li>
              <strong>User-agent: *</strong> applies rules globally to all automated search engine bots.
            </li>
            <li>
              <strong>Disallow: /admin</strong> prevents search crawlers from wasting crawl budget on private administration screens.
            </li>
            <li>
              <strong>Disallow: /api/</strong> ensures backend API calls are not indexed in search engine results.
            </li>
            <li>
              <strong>Sitemap: https://numvax.com/sitemap.xml</strong> informs crawlers of your full URL index structure during initial discovery.
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
