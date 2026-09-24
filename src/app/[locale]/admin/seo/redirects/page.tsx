'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowRightLeft, Plus, Trash2, Edit, Save, X, Search, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRedirect, setEditingRedirect] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRedirects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/admin/seo/redirects?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRedirects(data.redirects || []);
      }
    } catch (err) {
      console.error('Error fetching redirects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchRedirects, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenNew = () => {
    setEditingRedirect({
      id: '',
      sourceUrl: '',
      targetUrl: '',
      statusCode: 301,
      isActive: true,
    });
  };

  const handleOpenEdit = (r: any) => {
    setEditingRedirect({
      id: r.id,
      sourceUrl: r.sourceUrl,
      targetUrl: r.targetUrl,
      statusCode: r.statusCode,
      isActive: r.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const isNew = !editingRedirect.id;
      const url = isNew ? '/api/admin/seo/redirects' : `/api/admin/seo/redirects/${editingRedirect.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRedirect),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage(isNew ? 'Redirect created successfully!' : 'Redirect updated successfully!');
        setEditingRedirect(null);
        fetchRedirects();
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save redirect.');
      }
    } catch {
      setErrorMessage('Network error while saving redirect.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return;
    try {
      const res = await fetch(`/api/admin/seo/redirects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRedirects(redirects.filter((r) => r.id !== id));
      }
    } catch {
      alert('Error deleting redirect');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-neutral-800" /> URL Redirect Manager (301 & 302)
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage automatic permanent (301) and temporary (302) redirects to protect search rankings and prevent 404 broken links.
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Redirect Rule
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

        {/* Search */}
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search source or target URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500 font-semibold">Loading redirects...</span>
            </div>
          ) : redirects.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400">
              No active redirects configured. When URL slugs change, 301 redirects are automatically added here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Source URL (Old Path)</th>
                    <th className="py-3 px-4">Target Destination</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {redirects.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">{r.sourceUrl}</td>
                      <td className="py-3 px-4 font-mono text-neutral-700">{r.targetUrl}</td>
                      <td className="py-3 px-4">
                        <span className="bg-neutral-100 text-neutral-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {r.statusCode === 301 ? '301 Permanent' : '302 Temporary'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {r.isActive ? (
                          <span className="text-green-700 bg-green-50 font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                          </span>
                        ) : (
                          <span className="text-neutral-500 bg-neutral-100 font-bold px-2 py-0.5 rounded-md text-[11px]">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
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
        {editingRedirect && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900">
                  {editingRedirect.id ? 'Edit Redirect Rule' : 'Create New Redirect Rule'}
                </h3>
                <button
                  onClick={() => setEditingRedirect(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Source Path (Old URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="/old-bmi-calc"
                    value={editingRedirect.sourceUrl}
                    onChange={(e) => setEditingRedirect({ ...editingRedirect, sourceUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Target Path (Destination URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="/bmi-calculator"
                    value={editingRedirect.targetUrl}
                    onChange={(e) => setEditingRedirect({ ...editingRedirect, targetUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Redirect Code</label>
                    <select
                      value={editingRedirect.statusCode}
                      onChange={(e) => setEditingRedirect({ ...editingRedirect, statusCode: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 font-bold"
                    >
                      <option value={301}>301 (Permanent)</option>
                      <option value={302}>302 (Temporary)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRedirect.isActive}
                        onChange={(e) => setEditingRedirect({ ...editingRedirect, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-neutral-900"
                      />
                      Active Rule
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setEditingRedirect(null)}
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
                    Save Redirect
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
