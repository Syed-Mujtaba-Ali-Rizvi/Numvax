'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Search,
  Layers,
  ArrowRightLeft,
  Key,
  Compass,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function AdminSeoOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [seoIssues, setSeoIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setSeoIssues(data.seoIssues || []);
      }
    } catch (err) {
      console.error('Error fetching SEO overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Search className="w-6 h-6 text-neutral-800" /> SEO Management Suite
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comprehensive SEO audit, bulk editor, keyword tracking, 301 redirects, sitemap, and robots.txt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOverview}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Run SEO Scan
            </button>
            <Link
              href="/admin/seo/bulk"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs"
            >
              <Layers className="w-4 h-4" /> Open Bulk Editor
            </Link>
          </div>
        </div>

        {/* SEO Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/seo/bulk"
            className="p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl flex flex-col gap-3 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-xl text-neutral-800 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900">Open →</span>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">Bulk SEO Editor</div>
              <p className="text-xs text-neutral-500 mt-1">
                Spreadsheet-like inline editor to update meta titles, descriptions, and focus keywords for all tools at once.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/seo/keywords"
            className="p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl flex flex-col gap-3 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-xl text-neutral-800 transition-colors">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900">Open →</span>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">Keyword & Alias Manager</div>
              <p className="text-xs text-neutral-500 mt-1">
                Track primary, secondary, and long-tail target keywords across all tools and control internal search aliases.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/seo/redirects"
            className="p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl flex flex-col gap-3 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-xl text-neutral-800 transition-colors">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900">Open →</span>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">URL Redirects (301 / 302)</div>
              <p className="text-xs text-neutral-500 mt-1">
                Manage automated URL redirects when changing slugs to protect inbound backlinks and organic rankings.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/seo/sitemap"
            className="p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl flex flex-col gap-3 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-xl text-neutral-800 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900">Open →</span>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">Dynamic XML Sitemap</div>
              <p className="text-xs text-neutral-500 mt-1">
                Live sitemap status at <code className="font-mono text-[11px]">/sitemap.xml</code> with per-item inclusion toggles.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/seo/robots"
            className="p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl flex flex-col gap-3 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-xl text-neutral-800 transition-colors">
                <FileCode className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900">Open →</span>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">Robots.txt Editor</div>
              <p className="text-xs text-neutral-500 mt-1">
                Configure crawler directives with real-time safety warnings preventing accidental site blocking.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/settings/seo"
            className="p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl flex flex-col gap-3 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-xl text-neutral-800 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-900">Open →</span>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">Global SEO Defaults</div>
              <p className="text-xs text-neutral-500 mt-1">
                Configure global title templates, default meta descriptions, fallback OG images, and canonical behaviors.
              </p>
            </div>
          </Link>
        </div>

        {/* Audit Issues List */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900">SEO Health Audit ({seoIssues.length} Findings)</h3>
            </div>
            <span className="text-xs font-semibold text-neutral-400">Auto-detected from current database records</span>
          </div>

          {seoIssues.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-xs font-bold text-neutral-900">Your site SEO health is 100% compliant!</span>
              <p className="text-xs text-neutral-400">All tools and pages have valid titles, descriptions, and focus keywords.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {seoIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {issue.severity === 'critical' ? (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{issue.title}</div>
                      <div className="text-[11px] text-neutral-500">{issue.issue}</div>
                    </div>
                  </div>

                  <Link
                    href={issue.type === 'tool' ? `/admin/tools/${issue.id}` : `/admin/pages/${issue.id}`}
                    className="px-3 py-1.5 text-xs font-bold text-neutral-800 bg-white border border-neutral-200 hover:border-neutral-900 rounded-lg transition-colors"
                  >
                    Edit & Fix →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
