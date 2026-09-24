'use strict';
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  FileCode2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Globe,
  Layers,
  FileText,
  AlertTriangle,
  Sliders,
  Eye,
  Check,
} from 'lucide-react';

export default function AdminSitemapPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: {
      totalSitemapUrls: number;
      includedTools: number;
      excludedTools: number;
      totalCategories: number;
      totalPages: number;
    };
    tools: any[];
    pages: any[];
    categories: any[];
  } | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'included' | 'excluded' | 'noindex'>('all');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSitemapData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo/sitemap');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitemapData();
  }, []);

  const handleToggleTool = async (toolId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/seo/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, inSitemap: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `Tool sitemap status changed to ${!currentStatus ? 'Included' : 'Excluded'}` });
        fetchSitemapData();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to update status' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const handleBulkAction = async (action: 'include' | 'exclude') => {
    if (selectedTools.length === 0) return;
    try {
      const res = await fetch('/api/admin/seo/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkAction: action, toolIds: selectedTools }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: json.message });
        setSelectedTools([]);
        fetchSitemapData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to perform bulk action' });
    }
  };

  const filteredTools = (data?.tools || []).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'included') return t.inSitemap && !t.content?.noIndex && t.isEnabled;
    if (filter === 'excluded') return !t.inSitemap || !t.isEnabled || t.isDraft;
    if (filter === 'noindex') return t.content?.noIndex;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <FileCode2 className="w-6 h-6 text-neutral-900" />
              XML Sitemap Manager
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Configure search engine indexation coverage, verify sitemap endpoints, and control per-tool visibility.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Live XML
            </a>
            <button
              onClick={fetchSitemapData}
              disabled={loading}
              className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl">
            <div className="text-xs font-medium text-neutral-500">Live Sitemap URLs</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {loading ? '...' : data?.stats.totalSitemapUrls}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Autogenerated</div>
          </div>
          <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl">
            <div className="text-xs font-medium text-neutral-500">Included Tools</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {loading ? '...' : data?.stats.includedTools}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Search Engine Ready</div>
          </div>
          <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl">
            <div className="text-xs font-medium text-neutral-500">Excluded / Draft</div>
            <div className="text-2xl font-black text-neutral-400 mt-1">
              {loading ? '...' : data?.stats.excludedTools}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Hidden from crawler</div>
          </div>
          <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl">
            <div className="text-xs font-medium text-neutral-500">Categories</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {loading ? '...' : data?.stats.totalCategories}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Taxonomy nodes</div>
          </div>
          <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl">
            <div className="text-xs font-medium text-neutral-500">Static Pages</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {loading ? '...' : data?.stats.totalPages}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Legal & Informational</div>
          </div>
        </div>

        {/* Live URL Info Banner */}
        <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-700">
            <Globe className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>
              Canonical XML Endpoint:{' '}
              <code className="bg-white border border-neutral-200 px-2 py-0.5 rounded-md font-mono text-neutral-900 font-semibold">
                https://numvax.com/sitemap.xml
              </code>
            </span>
          </div>
          <div className="text-neutral-500 text-[11px]">
            Ping Google/Bing automatically on next regular search engine crawl cycle.
          </div>
        </div>

        {/* Tools Sitemap Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
          {/* Controls */}
          <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter tools by name, slug, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-neutral-100 p-0.5 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filter === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  All ({data?.tools.length || 0})
                </button>
                <button
                  onClick={() => setFilter('included')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filter === 'included' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Included
                </button>
                <button
                  onClick={() => setFilter('excluded')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filter === 'excluded' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Excluded
                </button>
                <button
                  onClick={() => setFilter('noindex')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filter === 'noindex' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  noIndex Tagged
                </button>
              </div>

              {selectedTools.length > 0 && (
                <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-2">
                  <button
                    onClick={() => handleBulkAction('include')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                  >
                    Include ({selectedTools.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('exclude')}
                    className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition"
                  >
                    Exclude ({selectedTools.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 text-neutral-500 font-semibold border-b border-neutral-200/80">
                <tr>
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredTools.length > 0 &&
                        selectedTools.length === filteredTools.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTools(filteredTools.map((t) => t.id));
                        } else {
                          setSelectedTools([]);
                        }
                      }}
                      className="rounded text-neutral-900 focus:ring-0"
                    />
                  </th>
                  <th className="p-3.5">Tool Name & URL Slug</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Index Status</th>
                  <th className="p-3.5">Sitemap Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400">
                      Loading sitemap entries...
                    </td>
                  </tr>
                ) : filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400">
                      No tools match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((tool) => {
                    const isIncluded = tool.inSitemap && tool.isEnabled && !tool.isDraft && !tool.content?.noIndex;
                    const isSelected = selectedTools.includes(tool.id);

                    return (
                      <tr key={tool.id} className="hover:bg-neutral-50/50 transition">
                        <td className="p-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTools([...selectedTools, tool.id]);
                              } else {
                                setSelectedTools(selectedTools.filter((id) => id !== tool.id));
                              }
                            }}
                            className="rounded text-neutral-900 focus:ring-0"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-neutral-900">{tool.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">/{tool.slug}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[11px] font-medium">
                            {tool.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {tool.content?.noIndex ? (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" /> noindex
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> index, follow
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {isIncluded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold">
                              <Check className="w-3 h-3" /> Included in XML
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md text-[11px] font-medium">
                              <XCircle className="w-3 h-3" /> Excluded
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleToggleTool(tool.id, tool.inSitemap)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              tool.inSitemap
                                ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'bg-neutral-900 text-white hover:bg-neutral-800'
                            }`}
                          >
                            {tool.inSitemap ? 'Exclude' : 'Include'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Non-Tool Nodes Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-neutral-700" />
              Category Pages ({data?.categories.length || 0})
            </h3>
            <p className="text-xs text-neutral-500 mb-3">All active tool categories are automatically present in XML sitemap.</p>
            <div className="flex flex-wrap gap-1.5">
              {(data?.categories || []).map((cat) => (
                <span key={cat.id} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-mono">
                  /tools/category/{cat.slug}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-neutral-700" />
              Static Content Pages ({data?.pages.length || 0})
            </h3>
            <p className="text-xs text-neutral-500 mb-3">Static pages with indexable meta configurations.</p>
            <div className="flex flex-wrap gap-1.5">
              {(data?.pages || []).map((p) => (
                <span key={p.id} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-mono">
                  /{p.slug}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
