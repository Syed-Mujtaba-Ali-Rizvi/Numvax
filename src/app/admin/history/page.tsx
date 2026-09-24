'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  History,
  RotateCcw,
  Clock,
  User,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/history', window.location.origin);
      if (typeFilter) url.searchParams.set('type', typeFilter);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter]);

  const handleRestore = async (historyId: string, title: string) => {
    if (!confirm(`Are you sure you want to restore "${title || 'this entry'}" to this revision state?`)) return;
    setRestoringId(historyId);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Revision restored successfully' });
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to restore revision' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error during restore' });
    } finally {
      setRestoringId(null);
    }
  };

  const filtered = history.filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.entityTitle && item.entityTitle.toLowerCase().includes(s)) ||
      (item.entityType && item.entityType.toLowerCase().includes(s)) ||
      (item.changedBy && item.changedBy.toLowerCase().includes(s)) ||
      (item.action && item.action.toLowerCase().includes(s))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-neutral-900" />
              Audit Log &amp; Revision History
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Track all SEO and content changes across Numvax with one-click revision restore.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded-xl text-neutral-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Log
          </button>
        </div>

        {/* Notification */}
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

        {/* Filter Controls */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by title, user, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 font-medium">Entity Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
            >
              <option value="">All Entities</option>
              <option value="tool">Tools</option>
              <option value="page">Static Pages</option>
              <option value="category">Categories</option>
              <option value="keyword">Keywords</option>
              <option value="redirect">Redirects</option>
              <option value="settings">Settings</option>
              <option value="robots">Robots.txt</option>
              <option value="sitemap">Sitemap</option>
            </select>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              Loading revision logs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              No revision records match your query.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                const canRestore = (item.entityType === 'tool' || item.entityType === 'page') && item.previousData;

                return (
                  <div key={item.id} className="p-4 hover:bg-neutral-50/50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            item.action === 'CREATE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-800'
                              : item.action === 'RESTORE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.action}
                        </span>

                        <div>
                          <div className="font-semibold text-xs text-neutral-900">
                            {item.entityTitle || `${item.entityType}: ${item.entityId}`}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.changedBy}
                            </span>
                            <span className="capitalize bg-neutral-100 px-1.5 py-0.2 rounded text-neutral-600 font-mono text-[10px]">
                              {item.entityType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {canRestore && (
                          <button
                            onClick={() => handleRestore(item.id, item.entityTitle)}
                            disabled={restoringId === item.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {restoringId === item.id ? 'Restoring...' : 'Restore'}
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 rounded-lg transition"
                          title="View Payload Diff"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable JSON Payload Inspection */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                        {item.previousData && (
                          <div className="p-3 bg-neutral-950 text-neutral-300 rounded-xl overflow-x-auto max-h-56">
                            <div className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Previous Snapshot:</div>
                            <pre className="leading-relaxed">{JSON.stringify(JSON.parse(item.previousData), null, 2)}</pre>
                          </div>
                        )}
                        {item.newData && (
                          <div className="p-3 bg-neutral-950 text-emerald-300 rounded-xl overflow-x-auto max-h-56">
                            <div className="text-[10px] text-neutral-400 font-bold uppercase mb-1">New Snapshot:</div>
                            <pre className="leading-relaxed">{JSON.stringify(JSON.parse(item.newData), null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
