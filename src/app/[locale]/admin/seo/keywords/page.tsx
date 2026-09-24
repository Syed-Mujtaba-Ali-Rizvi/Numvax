'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Key, Plus, Trash2, Edit, Save, X, Search, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminKeywordsPage() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [availableTargets, setAvailableTargets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [editingKeyword, setEditingKeyword] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedType) params.set('type', selectedType);

      const res = await fetch(`/api/admin/seo/keywords?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setKeywords(data.keywords || []);
        setAvailableTargets(data.availableTargets || []);
      }
    } catch (err) {
      console.error('Error fetching keywords:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchKeywords, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType]);

  const handleOpenNew = () => {
    setEditingKeyword({
      id: '',
      keyword: '',
      type: 'primary',
      targetSlug: '',
      targetType: 'tool',
      searchVolume: '',
      difficulty: '',
      notes: '',
    });
  };

  const handleOpenEdit = (kw: any) => {
    setEditingKeyword({
      id: kw.id,
      keyword: kw.keyword,
      type: kw.type,
      targetSlug: kw.targetSlug || '',
      targetType: kw.targetType || 'tool',
      searchVolume: kw.searchVolume || '',
      difficulty: kw.difficulty || '',
      notes: kw.notes || '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const isNew = !editingKeyword.id;
      const url = isNew ? '/api/admin/seo/keywords' : `/api/admin/seo/keywords/${editingKeyword.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingKeyword),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage(isNew ? 'Keyword added successfully!' : 'Keyword updated successfully!');
        setEditingKeyword(null);
        fetchKeywords();
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save keyword.');
      }
    } catch {
      setErrorMessage('Network error while saving keyword.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    try {
      const res = await fetch(`/api/admin/seo/keywords/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKeywords(keywords.filter((k) => k.id !== id));
      }
    } catch {
      alert('Error deleting keyword');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Key className="w-6 h-6 text-neutral-800" /> Keyword & Search Term Manager
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Organize target organic keywords, long-tail terms, and search synonyms across Numvax tools.
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Keyword
          </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keywords or target pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <option value="">All Keyword Types</option>
              <option value="primary">Primary Keywords</option>
              <option value="secondary">Secondary Keywords</option>
              <option value="long_tail">Long-Tail Keywords</option>
              <option value="related">Related Search Terms</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500 font-semibold">Loading keywords...</span>
            </div>
          ) : keywords.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400">
              No keywords found. Click &quot;Add Keyword&quot; to define target search terms.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Keyword Term</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Assigned Target Page</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {keywords.map((kw) => (
                    <tr key={kw.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-900">{kw.keyword}</td>
                      <td className="py-3 px-4">
                        <span className="bg-neutral-100 text-neutral-800 font-semibold px-2 py-0.5 rounded-md text-[11px] capitalize">
                          {kw.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700 text-[11px]">
                        {kw.targetSlug ? `/${kw.targetSlug}` : <span className="text-neutral-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">{kw.notes || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(kw)}
                            className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(kw.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {editingKeyword && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900">
                  {editingKeyword.id ? 'Edit Keyword' : 'Add New Keyword'}
                </h3>
                <button
                  onClick={() => setEditingKeyword(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Keyword Term</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., pdf merger online"
                    value={editingKeyword.keyword}
                    onChange={(e) => setEditingKeyword({ ...editingKeyword, keyword: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Type</label>
                    <select
                      value={editingKeyword.type}
                      onChange={(e) => setEditingKeyword({ ...editingKeyword, type: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="long_tail">Long-Tail</option>
                      <option value="related">Related Term</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Target Page / Tool</label>
                    <select
                      value={editingKeyword.targetSlug}
                      onChange={(e) => setEditingKeyword({ ...editingKeyword, targetSlug: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                      <option value="">-- None (Global) --</option>
                      {availableTargets.map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.title} (/{t.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Notes & Strategy</label>
                  <textarea
                    rows={2}
                    placeholder="Search intent, competitor notes, or placement notes..."
                    value={editingKeyword.notes}
                    onChange={(e) => setEditingKeyword({ ...editingKeyword, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setEditingKeyword(null)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Keyword
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
