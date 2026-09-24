'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FileText, Plus, ExternalLink, Edit, Trash2, RefreshCw, CheckCircle2, Home } from 'lucide-react';

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (data.success) setPages(data.pages || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-neutral-800" /> Static Pages Management
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Edit SEO metadata, headings, body text, and schema for core website pages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/pages/homepage"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all"
            >
              <Home className="w-4 h-4" /> Homepage Content
            </Link>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500 font-semibold">Loading pages...</span>
            </div>
          ) : pages.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400">No pages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Page Title</th>
                    <th className="py-3 px-4">Path / URL</th>
                    <th className="py-3 px-4">Focus Keyword</th>
                    <th className="py-3 px-4">Meta Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {pages.map((page) => {
                    const pageUrl = page.slug === 'homepage' ? 'https://numvax.com' : `https://numvax.com/${page.slug}`;
                    return (
                      <tr key={page.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-neutral-900">{page.title}</div>
                          <div className="text-[11px] text-neutral-400">{page.h1Title}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-600 text-[11px]">
                          /{page.slug === 'homepage' ? '' : page.slug}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {page.focusKeyword || <span className="text-neutral-400 italic">None</span>}
                        </td>
                        <td className="py-3 px-4 text-neutral-800 font-medium max-w-xs truncate">
                          {page.metaTitle || page.title}
                        </td>
                        <td className="py-3 px-4">
                          {page.isPublished ? (
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Published
                            </span>
                          ) : (
                            <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={pageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <Link
                              href={page.slug === 'homepage' ? '/admin/pages/homepage' : `/admin/pages/${page.id}`}
                              className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors font-bold flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </Link>
                          </div>
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
