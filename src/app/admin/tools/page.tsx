'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AdminToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStatus) params.set('status', selectedStatus);

      const [toolsRes, catRes] = await Promise.all([
        fetch(`/api/admin/tools?${params.toString()}`),
        fetch('/api/admin/categories'),
      ]);

      const toolsData = await toolsRes.json();
      const catData = await catRes.json();

      if (toolsData.success) setTools(toolsData.tools || []);
      if (catData.success) setCategories(catData.categories || []);
    } catch (err) {
      console.error('Error fetching tools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchTools, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTools(tools.filter((t) => t.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Error deleting tool:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-6 h-6 text-neutral-800" /> Tool Management
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage content, SEO metadata, categories, keywords, and visibility for all {tools.length} Numvax tools.
            </p>
          </div>

          <Link
            href="/admin/tools/new"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs w-fit"
          >
            <Plus className="w-4 h-4" /> Add New Tool
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, slug, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <option value="">All Statuses</option>
              <option value="published">Published & Active</option>
              <option value="draft">Drafts</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500 font-semibold">Loading tools...</span>
            </div>
          ) : tools.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400">
              No tools found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Tool Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Focus Keyword</th>
                    <th className="py-3 px-4">SEO Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900">{tool.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400">/{tool.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-neutral-100 text-neutral-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                          {tool.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-medium">
                        {tool.focusKeyword ? (
                          <span className="text-neutral-900 font-semibold">{tool.focusKeyword}</span>
                        ) : (
                          <span className="text-neutral-400 italic">None set</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            tool.seoScore >= 80
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : tool.seoScore >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {tool.seoScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {tool.isDraft ? (
                          <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            Draft
                          </span>
                        ) : tool.isEnabled ? (
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://numvax.com/${tool.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Link
                            href={`/admin/tools/${tool.id}`}
                            className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors font-bold flex items-center gap-1"
                            title="Edit Tool & SEO"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Link>

                          {deleteConfirmId === tool.id ? (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleDelete(tool.id)}
                                className="px-2 py-1 text-[11px] font-bold bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-[11px] font-bold bg-neutral-200 text-neutral-700 rounded-md"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(tool.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Tool"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
