'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Layers, Search, Save, CheckCircle2, AlertTriangle, RefreshCw, Filter, ExternalLink } from 'lucide-react';

export default function AdminBulkSeoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [initialItems, setInitialItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tool' | 'page'>('all');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/seo/bulk');
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
        setInitialItems(JSON.parse(JSON.stringify(data.items)));
        setDirtyIds(new Set());
      }
    } catch (err) {
      console.error('Error fetching bulk SEO items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // recalculate score on the fly
          let score = 100;
          if (!updated.seoTitle || updated.seoTitle.length < 30) score -= 25;
          if (!updated.metaDescription || updated.metaDescription.length < 80) score -= 25;
          if (!updated.focusKeyword) score -= 25;
          updated.seoScore = Math.max(0, score);
          return updated;
        }
        return item;
      })
    );
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const handleSaveAll = async () => {
    if (dirtyIds.size === 0) return;
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const modified = items.filter((item) => dirtyIds.has(item.id));
      const res = await fetch('/api/admin/seo/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: modified }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage(`Successfully updated SEO for ${data.updatedCount} items!`);
        setInitialItems(JSON.parse(JSON.stringify(items)));
        setDirtyIds(new Set());
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save bulk changes.');
      }
    } catch {
      setErrorMessage('Network error while saving bulk SEO changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.focusKeyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-neutral-800" /> Bulk SEO Editor
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Rapidly edit SEO titles, meta descriptions, and keywords across all tools and pages in one spreadsheet view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              disabled={isSaving || dirtyIds.size === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save All ({dirtyIds.size} Modified)
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tools & pages by name, slug, title, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold w-fit">
            {(['all', 'tool', 'page'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                  filterType === t ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {t === 'all' ? 'All Items' : `${t}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500 font-semibold">Loading SEO spreadsheet...</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3 w-48">Item / URL</th>
                    <th className="py-3 px-3 w-72">SEO Title</th>
                    <th className="py-3 px-3 w-80">Meta Description</th>
                    <th className="py-3 px-3 w-40">Focus Keyword</th>
                    <th className="py-3 px-3 w-20 text-center">Score</th>
                    <th className="py-3 px-3 w-20 text-center">NoIndex</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredItems.map((item) => {
                    const isDirty = dirtyIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${isDirty ? 'bg-amber-50/60' : 'hover:bg-neutral-50/60'}`}
                      >
                        {/* Name & URL */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-neutral-900 truncate max-w-[150px]">{item.name}</span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-neutral-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate">/{item.slug}</div>
                        </td>

                        {/* SEO Title */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.seoTitle}
                            onChange={(e) => handleChange(item.id, 'seoTitle', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400"
                          />
                        </td>

                        {/* Meta Description */}
                        <td className="py-2.5 px-3">
                          <textarea
                            rows={2}
                            value={item.metaDescription}
                            onChange={(e) => handleChange(item.id, 'metaDescription', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400"
                          />
                        </td>

                        {/* Focus Keyword */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.focusKeyword}
                            onChange={(e) => handleChange(item.id, 'focusKeyword', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400"
                          />
                        </td>

                        {/* SEO Score */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              item.seoScore >= 80
                                ? 'bg-green-100 text-green-800'
                                : item.seoScore >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.seoScore}
                          </span>
                        </td>

                        {/* NoIndex */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.noIndex}
                            onChange={(e) => handleChange(item.id, 'noIndex', e.target.checked)}
                            className="w-4 h-4 rounded text-neutral-900"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
